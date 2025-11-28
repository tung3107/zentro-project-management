import { useState, useEffect } from 'react'
import { Calendar, FileText, TrendingUp, Users, Clock, Download, Mail, Loader2, AlertCircle } from 'lucide-react'
import styled from 'styled-components'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import {
  generateReport,
  getAvailableProjects,
  getTeamMembers,
  type ReportFilters,
  type Report,
  type ProjectOption,
  type TeamMember
} from '../service/report.service'

const ContentLayout = styled.div`
  padding: 30px 40px;
  font-family: 'Space Grotesk', sans-serif;
  background: #f8f8f8;
  min-height: 100vh;

  h1 {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 30px;
    color: #1a1a1a;
  }
`

const FilterSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  h2 {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 20px;
    color: #1a1a1a;
  }
`

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-size: 14px;
    font-weight: 500;
    color: #333;
  }

  select,
  input {
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 14px;
    font-family: 'Space Grotesk', sans-serif;
    transition: all 0.2s;

    &:focus {
      outline: none;
      border-color: #cb0404;
      box-shadow: 0 0 0 3px rgba(203, 4, 4, 0.1);
    }
  }
`

const ReportTypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
`

const ReportTypeCard = styled.div<{ selected: boolean }>`
  padding: 16px;
  border: 2px solid ${(props) => (props.selected ? '#cb0404' : '#e0e0e0')};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${(props) => (props.selected ? '#fff5f5' : 'white')};

  &:hover {
    border-color: #cb0404;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .icon {
    margin-bottom: 8px;
    color: ${(props) => (props.selected ? '#cb0404' : '#666')};
  }

  .title {
    font-weight: 600;
    font-size: 14px;
    color: ${(props) => (props.selected ? '#cb0404' : '#333')};
    margin-bottom: 4px;
  }

  .description {
    font-size: 12px;
    color: #666;
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  font-family: 'Space Grotesk', sans-serif;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;

  ${(props) =>
    props.variant === 'primary'
      ? `
    background: #cb0404;
    color: white;
    &:hover {
      background: #a00303;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(203, 4, 4, 0.3);
    }
  `
      : `
    background: white;
    color: #333;
    border: 1px solid #ddd;
    &:hover {
      background: #f5f5f5;
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }
`

const ReportSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`

const StatCard = styled.div`
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;

  &:nth-child(2) {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }

  &:nth-child(3) {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  }

  &:nth-child(4) {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  }

  &:nth-child(5) {
    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  }

  .label {
    font-size: 13px;
    opacity: 0.9;
    margin-bottom: 8px;
  }

  .value {
    font-size: 28px;
    font-weight: 700;
  }
`

const AIAnalysisSection = styled.div`
  background: #f9fafb;
  border-radius: 12px;
  padding: 24px;
  margin-top: 24px;
  border-left: 4px solid #cb0404;

  h3 {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
    color: #1a1a1a;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .markdown-content {
    color: #333;
    line-height: 1.8;

    h1,
    h2,
    h3,
    h4 {
      margin-top: 24px;
      margin-bottom: 12px;
      color: #1a1a1a;
    }

    h1 {
      font-size: 24px;
    }
    h2 {
      font-size: 20px;
    }
    h3 {
      font-size: 18px;
    }

    p {
      margin-bottom: 12px;
    }

    ul,
    ol {
      margin-left: 24px;
      margin-bottom: 12px;
    }

    li {
      margin-bottom: 8px;
    }

    strong {
      color: #cb0404;
      font-weight: 600;
    }

    code {
      background: #f0f0f0;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 13px;
    }

    blockquote {
      border-left: 3px solid #cb0404;
      padding-left: 16px;
      margin: 16px 0;
      color: #666;
      font-style: italic;
    }
  }
`

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;

  .icon {
    margin-bottom: 16px;
  }

  h3 {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #333;
  }

  p {
    font-size: 14px;
    color: #666;
  }
`

const LoadingOverlay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;

  .spinner {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  p {
    font-size: 16px;
    color: #666;
  }
`

const reportTypes = [
  {
    id: 'project_progress',
    title: 'Tiến độ dự án',
    description: 'Tổng quan về task hoàn thành, pending, delayed',
    icon: TrendingUp
  },
  {
    id: 'team_performance',
    title: 'Hiệu suất team',
    description: 'Phân tích năng suất từng thành viên',
    icon: Users
  },
  {
    id: 'task_deadline',
    title: 'Task & Deadline',
    description: 'Task quá hạn và sắp tới deadline',
    icon: Clock
  },
  {
    id: 'general',
    title: 'Báo cáo tổng hợp',
    description: 'Báo cáo toàn diện về dự án',
    icon: FileText
  }
]

export default function ReportTab() {
  const [filters, setFilters] = useState<ReportFilters>({
    reportType: 'project_progress',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    projectId: '',
    userId: ''
  })

  const [report, setReport] = useState<Report | null>(null)
  const [projects, setProjects] = useState<ProjectOption[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingProjects, setLoadingProjects] = useState(true)

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    if (filters.projectId) {
      loadTeamMembers(filters.projectId)
    } else {
      setTeamMembers([])
    }
  }, [filters.projectId])

  const loadProjects = async () => {
    try {
      setLoadingProjects(true)
      const data = await getAvailableProjects()
      setProjects(data)
    } catch (error: any) {
      toast.error('Không thể tải danh sách dự án')
      console.error('Load projects error:', error)
    } finally {
      setLoadingProjects(false)
    }
  }

  const loadTeamMembers = async (projectId: string) => {
    try {
      const data = await getTeamMembers(projectId)
      setTeamMembers(data)
    } catch (error: any) {
      toast.error('Không thể tải danh sách thành viên')
      console.error('Load team members error:', error)
    }
  }

  const handleGenerateReport = async () => {
    try {
      setLoading(true)
      const data = await generateReport(filters)
      setReport(data)
      toast.success('Tạo báo cáo thành công!')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể tạo báo cáo')
      console.error('Generate report error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportPDF = async () => {
    if (!report) return
    toast.info('Tính năng xuất PDF đang được phát triển')
  }

  const handleSendEmail = async () => {
    if (!report) return
    toast.info('Tính năng gửi email đang được phát triển')
  }

  return (
    <ContentLayout>
      <h1>📊 Báo cáo Dự án</h1>

      <FilterSection>
        <h2>Bộ lọc báo cáo</h2>

        <div>
          <label style={{ fontSize: '14px', fontWeight: 500, marginBottom: '12px', display: 'block' }}>
            Loại báo cáo
          </label>
          <ReportTypeGrid>
            {reportTypes.map((type) => {
              const Icon = type.icon
              return (
                <ReportTypeCard
                  key={type.id}
                  selected={filters.reportType === type.id}
                  onClick={() => setFilters({ ...filters, reportType: type.id as any })}
                >
                  <Icon className='icon' size={24} />
                  <div className='title'>{type.title}</div>
                  <div className='description'>{type.description}</div>
                </ReportTypeCard>
              )
            })}
          </ReportTypeGrid>
        </div>

        <FilterGrid>
          <FormGroup>
            <label>Từ ngày</label>
            <input
              type='date'
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
          </FormGroup>

          <FormGroup>
            <label>Đến ngày</label>
            <input
              type='date'
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
          </FormGroup>

          <FormGroup>
            <label>Dự án</label>
            <select value={filters.projectId} onChange={(e) => setFilters({ ...filters, projectId: e.target.value })}>
              <option value=''>Tất cả dự án</option>
              {loadingProjects ? (
                <option disabled>Đang tải...</option>
              ) : (
                projects.map((project) => (
                  <option key={project.project_id} value={project.project_id}>
                    {project.project_name}
                  </option>
                ))
              )}
            </select>
          </FormGroup>

          <FormGroup>
            <label>Thành viên</label>
            <select
              value={filters.userId}
              onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
              disabled={!filters.projectId}
            >
              <option value=''>Tất cả thành viên</option>
              {teamMembers.map((member) => (
                <option key={member.user_id} value={member.user_id}>
                  {member.name}
                </option>
              ))}
            </select>
          </FormGroup>
        </FilterGrid>

        <ButtonGroup>
          <Button onClick={handleGenerateReport} variant='primary' disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={18} className='spinner' />
                Đang tạo báo cáo...
              </>
            ) : (
              <>
                <FileText size={18} />
                Tạo báo cáo
              </>
            )}
          </Button>
        </ButtonGroup>
      </FilterSection>

      {loading ? (
        <ReportSection>
          <LoadingOverlay>
            <Loader2 size={48} className='spinner' color='#cb0404' />
            <p>Đang phân tích dữ liệu và tạo báo cáo...</p>
          </LoadingOverlay>
        </ReportSection>
      ) : report ? (
        <ReportSection>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>Kết quả báo cáo</h2>
            <ButtonGroup>
              <Button onClick={handleExportPDF}>
                <Download size={18} />
                Xuất PDF
              </Button>
              <Button onClick={handleSendEmail}>
                <Mail size={18} />
                Gửi Email
              </Button>
            </ButtonGroup>
          </div>

          <StatsGrid>
            <StatCard>
              <div className='label'>Tổng số Task</div>
              <div className='value'>{report.data.stats.total_tasks}</div>
            </StatCard>
            <StatCard>
              <div className='label'>Hoàn thành</div>
              <div className='value'>
                {report.data.stats.completed_tasks} ({report.data.stats.completion_percentage}%)
              </div>
            </StatCard>
            <StatCard>
              <div className='label'>Đang làm</div>
              <div className='value'>{report.data.stats.in_progress_tasks}</div>
            </StatCard>
            <StatCard>
              <div className='label'>Quá hạn</div>
              <div className='value'>{report.data.stats.overdue_tasks}</div>
            </StatCard>
            <StatCard>
              <div className='label'>Sprint</div>
              <div className='value'>
                {report.data.stats.sprint_stats.active}/{report.data.stats.sprint_stats.total}
              </div>
            </StatCard>
          </StatsGrid>

          <AIAnalysisSection>
            <h3>
              <FileText size={20} />
              Phân tích AI
            </h3>
            <div className='markdown-content'>
              <ReactMarkdown>{report.aiAnalysis}</ReactMarkdown>
            </div>
          </AIAnalysisSection>
        </ReportSection>
      ) : (
        <ReportSection>
          <EmptyState>
            <AlertCircle size={48} color='#999' className='icon' />
            <h3>Chưa có báo cáo</h3>
            <p>Vui lòng chọn bộ lọc và nhấn "Tạo báo cáo" để xem kết quả</p>
          </EmptyState>
        </ReportSection>
      )}
    </ContentLayout>
  )
}
