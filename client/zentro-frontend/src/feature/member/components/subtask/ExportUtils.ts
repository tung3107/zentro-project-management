import { format } from 'date-fns'
import type { Task } from '../../../../types/task'
import { priorityColors } from '../../../../types/type'
import type { Status } from './types'

export const exportToCSV = (tasks: Task[], statuses: Status[]) => {
  const csvContent = [
    ['ID', 'Tên công việc', 'Loại', 'Trạng thái', 'Người phụ trách', 'Hạn hoàn thành', 'Độ ưu tiên'].join(','),
    ...tasks
      .filter((t) => !t.parent_id)
      .map((task) => {
        const assignee = task.assignee ? `${(task.assignee as any).first_name} ${(task.assignee as any).last_name}` : ''
        const status = statuses.find((s) => s.id === task.status_id)?.name || ''
        const priority = priorityColors.find((p) => p.value === task.priority)?.label || ''
        const dueDate = task.due_date ? format(new Date(task.due_date), 'dd/MM/yyyy') : ''
        return [
          task.task_id,
          `"${(task.title || '').replace(/"/g, '""')}"`,
          task.type || '',
          status,
          assignee,
          dueDate,
          priority
        ].join(',')
      })
  ].join('\n')

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `tasks_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`
  link.click()
}

export const exportToExcel = (tasks: Task[], statuses: Status[]) => {
  const tableHTML = `
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Tên công việc</th>
          <th>Loại</th>
          <th>Trạng thái</th>
          <th>Người phụ trách</th>
          <th>Hạn hoàn thành</th>
          <th>Độ ưu tiên</th>
        </tr>
      </thead>
      <tbody>
        ${tasks
          .filter((t) => !t.parent_id)
          .map((task) => {
            const assignee = task.assignee
              ? `${(task.assignee as any).first_name} ${(task.assignee as any).last_name}`
              : ''
            const status = statuses.find((s) => s.id === task.status_id)?.name || ''
            const priority = priorityColors.find((p) => p.value === task.priority)?.label || ''
            const dueDate = task.due_date ? format(new Date(task.due_date), 'dd/MM/yyyy') : ''
            return `
              <tr>
                <td>${task.task_id}</td>
                <td>${task.title || ''}</td>
                <td>${task.type || ''}</td>
                <td>${status}</td>
                <td>${assignee}</td>
                <td>${dueDate}</td>
                <td>${priority}</td>
              </tr>
            `
          })
          .join('')}
      </tbody>
    </table>
  `

  const blob = new Blob([tableHTML], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `tasks_${format(new Date(), 'yyyyMMdd_HHmmss')}.xls`
  link.click()
}

export const exportToXML = (tasks: Task[], statuses: Status[]) => {
  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<tasks>
  ${tasks
    .filter((t) => !t.parent_id)
    .map((task) => {
      const assignee = task.assignee ? `${(task.assignee as any).first_name} ${(task.assignee as any).last_name}` : ''
      const status = statuses.find((s) => s.id === task.status_id)?.name || ''
      const priority = priorityColors.find((p) => p.value === task.priority)?.label || ''
      const dueDate = task.due_date ? format(new Date(task.due_date), 'dd/MM/yyyy') : ''
      return `
    <task>
      <id>${task.task_id}</id>
      <title><![CDATA[${task.title || ''}]]></title>
      <type>${task.type || ''}</type>
      <status>${status}</status>
      <assignee>${assignee}</assignee>
      <dueDate>${dueDate}</dueDate>
      <priority>${priority}</priority>
    </task>`
    })
    .join('')}
</tasks>`

  const blob = new Blob([xmlContent], { type: 'application/xml' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `tasks_${format(new Date(), 'yyyyMMdd_HHmmss')}.xml`
  link.click()
}

export const exportToHTML = (tasks: Task[], statuses: Status[]) => {
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Danh sách công việc</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #f2f2f2; font-weight: bold; }
    tr:nth-child(even) { background-color: #f9f9f9; }
  </style>
</head>
<body>
  <h1>Danh sách công việc</h1>
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Tên công việc</th>
        <th>Loại</th>
        <th>Trạng thái</th>
        <th>Người phụ trách</th>
        <th>Hạn hoàn thành</th>
        <th>Độ ưu tiên</th>
      </tr>
    </thead>
    <tbody>
      ${tasks
        .filter((t) => !t.parent_id)
        .map((task) => {
          const assignee = task.assignee
            ? `${(task.assignee as any).first_name} ${(task.assignee as any).last_name}`
            : ''
          const status = statuses.find((s) => s.id === task.status_id)?.name || ''
          const priority = priorityColors.find((p) => p.value === task.priority)?.label || ''
          const dueDate = task.due_date ? format(new Date(task.due_date), 'dd/MM/yyyy') : ''
          return `
        <tr>
          <td>${task.task_id}</td>
          <td>${task.title || ''}</td>
          <td>${task.type || ''}</td>
          <td>${status}</td>
          <td>${assignee}</td>
          <td>${dueDate}</td>
          <td>${priority}</td>
        </tr>
      `
        })
        .join('')}
    </tbody>
  </table>
</body>
</html>`

  const blob = new Blob([htmlContent], { type: 'text/html' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `tasks_${format(new Date(), 'yyyyMMdd_HHmmss')}.html`
  link.click()
}

export const exportToWord = (tasks: Task[], statuses: Status[]) => {
  const wordContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<?mso-application progid="Word.Document"?>
<w:wordDocument xmlns:w="http://schemas.microsoft.com/office/word/2003/wordml">
  <w:body>
    <w:p>
      <w:r>
        <w:t>Danh sách công việc</w:t>
      </w:r>
    </w:p>
    <w:tbl>
      <w:tr>
        <w:tc><w:p><w:r><w:t>ID</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>Tên công việc</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>Loại</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>Trạng thái</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>Người phụ trách</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>Hạn hoàn thành</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>Độ ưu tiên</w:t></w:r></w:p></w:tc>
      </w:tr>
      ${tasks
        .filter((t) => !t.parent_id)
        .map((task) => {
          const assignee = task.assignee
            ? `${(task.assignee as any).first_name} ${(task.assignee as any).last_name}`
            : ''
          const status = statuses.find((s) => s.id === task.status_id)?.name || ''
          const priority = priorityColors.find((p) => p.value === task.priority)?.label || ''
          const dueDate = task.due_date ? format(new Date(task.due_date), 'dd/MM/yyyy') : ''
          return `
        <w:tr>
          <w:tc><w:p><w:r><w:t>${task.task_id}</w:t></w:r></w:p></w:tc>
          <w:tc><w:p><w:r><w:t>${task.title || ''}</w:t></w:r></w:p></w:tc>
          <w:tc><w:p><w:r><w:t>${task.type || ''}</w:t></w:r></w:p></w:tc>
          <w:tc><w:p><w:r><w:t>${status}</w:t></w:r></w:p></w:tc>
          <w:tc><w:p><w:r><w:t>${assignee}</w:t></w:r></w:p></w:tc>
          <w:tc><w:p><w:r><w:t>${dueDate}</w:t></w:r></w:p></w:tc>
          <w:tc><w:p><w:r><w:t>${priority}</w:t></w:r></w:p></w:tc>
        </w:tr>
      `
        })
        .join('')}
    </w:tbl>
  </w:body>
</w:wordDocument>`

  const blob = new Blob([wordContent], { type: 'application/msword' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `tasks_${format(new Date(), 'yyyyMMdd_HHmmss')}.doc`
  link.click()
}
