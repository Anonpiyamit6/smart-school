const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env, ctx) {
    // 1. จัดการเรื่อง CORS อนุญาตให้หน้าเว็บเชื่อมต่อได้
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method === "POST") {
      try {
        const body = await request.json();
        const action = body.action; // ชื่อฟังก์ชันที่หน้าเว็บเรียกมา
        const args = body.args || []; // ข้อมูลที่ส่งมาด้วย

        // ==========================================
        // 🛠️ ส่วนจัดการคำสั่ง (Routes)
        // ==========================================

        // 1. ดึงการตั้งค่าโรงเรียน
        if (action === "getAppConfig") {
          return Response.json({ "ชื่อโรงเรียน": "โรงเรียนของคุณ (แก้ไขได้ในตั้งค่า)", "ปีการศึกษา": "2567", "ภาคเรียน": "1" }, { headers: corsHeaders });
        }

        // 2. โหลดชั้นเรียนและห้อง (ดึงจากฐานข้อมูล D1)
        if (action === "getAvailableGradeSections") {
          const { results } = await env.DB.prepare("SELECT DISTINCT grade, section FROM students ORDER BY grade, section").all();
          let gradeSections = {};
          if (results && results.length > 0) {
            results.forEach(r => {
              if(!gradeSections[r.grade]) gradeSections[r.grade] = [];
              gradeSections[r.grade].push(r.section);
            });
          }
          return Response.json({ success: true, gradeSections }, { headers: corsHeaders });
        }

        // 3. ดึงรายชื่อนักเรียนในห้อง
        if (action === "getStudentsByRoom") {
          const grade = args[0];
          const section = args[1];
          const { results } = await env.DB.prepare("SELECT * FROM students WHERE grade = ? AND section = ? ORDER BY CAST(number AS INTEGER)").bind(grade, section).all();
          return Response.json({ success: true, students: results }, { headers: corsHeaders });
        }

        // 4. บันทึกข้อมูลนักเรียน
        if (action === "addStudentsBulk") {
          const students = args[0]; // array ของนักเรียน
          const stmts = students.map(st => 
            env.DB.prepare("INSERT OR REPLACE INTO students (grade, section, room, number, student_id, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?, ?)")
            .bind(st[0], st[1], st[2], st[3], st[4], st[5], st[6])
          );
          await env.DB.batch(stmts);
          return Response.json({ success: true, message: `เพิ่มรายชื่อสำเร็จ ${students.length} คน` }, { headers: corsHeaders });
        }

        // หากยังไม่ได้เขียน API สำหรับฟังก์ชันนั้น
        return Response.json({ success: false, error: `ฟังก์ชัน ${action} กำลังอยู่ในช่วงอัปเดตย้ายระบบ` }, { headers: corsHeaders });

      } catch (error) {
        return Response.json({ success: false, error: "Server Error: " + error.message }, { headers: corsHeaders });
      }
    }

    return new Response("Smart School API is running!", { headers: corsHeaders });
  }
};
