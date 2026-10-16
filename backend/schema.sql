-- 1. ตารางตั้งค่า (Config)
CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT
);

-- 2. ตารางนักเรียน
CREATE TABLE IF NOT EXISTS students (
    student_id TEXT PRIMARY KEY,
    grade TEXT NOT NULL,
    section TEXT NOT NULL,
    room TEXT,
    number TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL
);

-- 3. ตารางวิชาและห้องเรียน (Classes)
CREATE TABLE IF NOT EXISTS classes (
    class_id TEXT PRIMARY KEY,
    subject_code TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    teacher TEXT,
    grade TEXT NOT NULL,
    section TEXT NOT NULL,
    teach_day TEXT,
    period TEXT,
    total_hours INTEGER DEFAULT 40
);

-- 4. ตารางเช็คชื่อ (Attendance)
CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id TEXT NOT NULL,
    date TEXT NOT NULL,
    student_id TEXT NOT NULL,
    status TEXT NOT NULL,
    time TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. ตารางหัวข้อคะแนน (Score Topics)
CREATE TABLE IF NOT EXISTS score_topics (
    topic_id TEXT PRIMARY KEY,
    class_id TEXT NOT NULL,
    category_id TEXT NOT NULL,
    name TEXT NOT NULL,
    max_score REAL NOT NULL,
    chapter_name TEXT,
    assess_type TEXT
);

-- 6. ตารางคะแนน (Scores)
CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id TEXT NOT NULL,
    topic_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    raw_score REAL,
    original_score REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(class_id, topic_id, student_id)
);
