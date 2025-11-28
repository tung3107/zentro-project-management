# 🚀 Report System Setup Guide

## Quick Setup (3 Steps)

### Step 1: Create Database Table

Run the migration script:

```bash
mysql -u root -p doanha_db < server/migrations/create_reports_table.sql
```

Or run manually in MySQL:

```sql
USE doanha_db;
SOURCE server/migrations/create_reports_table.sql;
```

### Step 2: Verify Installation

The required package (`node-cron`) has already been installed. Verify:

```bash
cd server
npm list node-cron
```

### Step 3: Restart Server

```bash
cd server
npm start
```

You should see:

```
App is running on port 5000
DB connect successfully
📅 Report scheduler initialized - Reports will be generated daily at 6 PM
```

---

## ✅ Verification

### 1. Test Manual Report Generation

Go to any project and click the "Báo cáo" tab, then:

1. Select report type
2. Choose date range
3. Click "Tạo báo cáo"

**Expected:**

- Report generates successfully
- Check database: `SELECT * FROM reports ORDER BY created_at DESC LIMIT 1;`
- Check file: `server/uploads/reports/` should have a new JSON file

### 2. Verify Auto-Scheduler is Running

Check console when server starts:

```
✅ Should see: "📅 Report scheduler initialized"
```

### 3. Test Auto-Generation (Optional - Don't Wait for 6 PM)

Temporarily modify `server/scheduler/reportScheduler.js`:

```javascript
// Change this line:
cron.schedule("0 18 * * *", async () => {

// To run in 1 minute:
cron.schedule("*/1 * * * *", async () => {
```

Restart server and wait 1 minute. Check:

- Console logs
- Database for new reports
- Files in `server/uploads/reports/`

**Remember to change back to 6 PM schedule after testing!**

---

## 📁 Directory Structure

Ensure this directory exists:

```
server/
├── uploads/
│   └── reports/          ← Auto-created by system
│       └── report_*.json
```

If it doesn't exist, it will be created automatically when the first report is generated.

---

## 🔧 Configuration

### Change Schedule Time

Edit `server/scheduler/reportScheduler.js`:

```javascript
// Currently: Every day at 6 PM
cron.schedule("0 18 * * *", async () => {

// Options:
// 9 AM daily:        "0 9 * * *"
// Every 6 hours:     "0 */6 * * *"
// Weekdays at 6 PM:  "0 18 * * 1-5"
// Every hour:        "0 * * * *"
```

### Change Project Filter

Edit `server/scheduler/reportScheduler.js`:

```javascript
// Currently checks: status = "Active"
const projects = await Project.findAll({
  where: {
    status: "Active", // Change this to your project status value
  },
});

// Or get ALL projects:
const projects = await Project.findAll();
```

---

## 🧪 Testing Checklist

- [ ] Database table `reports` exists
- [ ] `node-cron` package installed
- [ ] Server starts without errors
- [ ] Scheduler initialization message appears
- [ ] Manual report generation works
- [ ] Report saved to database
- [ ] JSON file created in uploads/reports/
- [ ] Can fetch report history via API
- [ ] Auto-generation works (test or wait for 6 PM)

---

## 📊 Monitor Reports

### View All Reports

```sql
SELECT
  report_id,
  project_id,
  report_type,
  report_name,
  is_auto_generated,
  generated_by,
  created_at
FROM reports
ORDER BY created_at DESC
LIMIT 20;
```

### Check Auto-Generated Reports

```sql
SELECT * FROM reports
WHERE is_auto_generated = TRUE
ORDER BY created_at DESC;
```

### Reports by Project

```sql
SELECT project_id, COUNT(*) as total_reports
FROM reports
GROUP BY project_id;
```

---

## 🐛 Troubleshooting

### Issue: Scheduler not running

**Check:**

1. `node-cron` installed? → `npm list node-cron`
2. Server logs show scheduler init message?
3. Any errors in console?

**Fix:**

```bash
cd server
npm install node-cron
npm start
```

### Issue: Reports not saving to database

**Check:**

1. Database table exists? → Run migration script
2. Model relationships loaded? → Check `server/models/index.js`
3. Check server logs for errors

**Fix:**

```bash
# Re-run migration
mysql -u root -p doanha_db < server/migrations/create_reports_table.sql
```

### Issue: Files not saving

**Check:**

1. Directory permissions
2. Disk space

**Fix:**

```bash
# Manually create directory if needed
mkdir -p server/uploads/reports
chmod 755 server/uploads/reports
```

### Issue: Auto-generation not triggering at 6 PM

**Check:**

1. Server running continuously?
2. Server time zone correct?
3. Check server logs at 6 PM

**Debug:**

```javascript
// Add to reportScheduler.js
console.log("Current server time:", new Date());
console.log("Scheduler running:", cron.getTasks().length > 0);
```

---

## 🎯 Next Steps

After setup is complete:

1. **Test the system**

   - Generate a manual report
   - Check database and files
   - Verify report history API

2. **Wait for 6 PM** (or modify schedule for testing)

   - Observe auto-generation
   - Check console logs
   - Verify reports in database

3. **Frontend integration** (future)
   - Display report history in UI
   - Download report files
   - View past reports

---

## 📞 Support

If you encounter issues:

1. Check server console logs
2. Check database for errors: `SHOW ERRORS;`
3. Verify all files exist in `server/` directory
4. Check `REPORT_AUTO_GENERATION_SUMMARY.md` for detailed docs

---

## ✅ System is Ready!

Once you see this in the console:

```
📅 Report scheduler initialized - Reports will be generated daily at 6 PM
```

Your automatic report generation system is **live and running**! 🎉

Reports will be automatically generated every day at 6 PM for all active projects, saved to the database, and stored as JSON files.
