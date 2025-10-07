import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { TabView, TabPanel } from 'primereact/tabview'
import AdminNavigation from '../components/AdminNavigation'
import PermissionMatrix, { type Role } from '../components/PermissionMatrix'
import ProjectRoleCom from '../components/ProjectRoleCom'
import { useLocation, useNavigate } from 'react-router-dom'

export const ContentLayout = styled.div`
  padding: 30px 40px;

  font-family: 'Space Grotesk', sans-serif;

  .p-tabview {
    margin-top: 30px;
  }

  /* Tab Folder Style */
  .p-tabview .p-tabview-nav {
    background: transparent;
    border: none;
    gap: 0.5rem;
  }

  .p-tabview .p-tabview-nav li .p-tabview-nav-link {
    border: 1px solid transparent;
    border-radius: 10px 10px 0 0;
    padding: 0.7rem 1.4rem;
    font-weight: 600;
    color: #666;
    background: #f3f4f6;
    transition: all 0.3s ease;
  }

  .p-tabview .p-tabview-nav li .p-tabview-nav-link:hover {
    background: #e5e7eb;
    color: #cb0404;
  }

  .p-tabview .p-tabview-nav li.p-highlight .p-tabview-nav-link {
    background: white;
    color: #cb0404;
    border: 1px solid #ddd;
    border-bottom: none; /* nối liền panel */
    position: relative;
    top: 1px;
    z-index: 1;
  }

  /* Panel nối tab */
  .p-tabview .p-tabview-panels {
    border: 1px solid #ddd;
    border-radius: 0 12px 12px 12px;
    background: white;
    padding: 1.5rem;
    animation: fadeIn 0.35s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Card chic style */
  .p-card {
    border-radius: 14px;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
    transition: all 0.25s ease;
  }
  .p-card:hover {
    box-shadow: 0 6px 18px rgba(203, 4, 4, 0.35);
    transform: translateY(-3px);
  }
  .role-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #cb0404;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    margin-right: 12px;
    font-size: 18px;
  }
`

const systemRoles: Role[] = [
  {
    role_id: 1,
    role_name: 'Supper Admin',
    description: 'Toàn quyền quản lý hệ thống',
    icon: 'pi pi-shield',
    permissions: [
      { name: 'Truy cập Admin Site', allowed: true },
      { name: 'Truy cập Member Site', allowed: false },
      { name: 'Tạo Project', allowed: true },
      { name: 'Chỉnh sửa Project', allowed: true },
      { name: 'Xóa Project', allowed: true },
      { name: 'Thao tác các task trong project', allowed: false },

      { name: 'Thay đổi Users & Quyền', allowed: true }
    ]
  },
  {
    role_id: 2,
    role_name: 'Member',
    description: 'Thành viên dự án',
    icon: 'pi pi-user',
    permissions: [
      { name: 'Truy cập Admin Site', allowed: false },
      { name: 'Truy cập Member Site', allowed: true },
      { name: 'Thao tác các task trong project', allowed: true },

      { name: 'Thay đổi Users & Quyền', allowed: false }
    ]
  }
]

export default function Role() {
  const [activeIndex, setActiveIndex] = useState(0)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const type = params.get('type')

    if (type === 'project') {
      setActiveIndex(1)
    } else {
      setActiveIndex(0)
    }
  }, [location.search])

  // 🎯 Khi đổi tab -> update URL tương ứng
  const handleTabChange = (e: { index: number }) => {
    setActiveIndex(e.index)
    const newType = e.index === 1 ? 'project' : 'system'
    navigate(`?type=${newType}`)
  }

  return (
    <ContentLayout>
      <AdminNavigation />

      <TabView activeIndex={activeIndex} onTabChange={handleTabChange}>
        <TabPanel header='System Role' leftIcon='pi pi-lock mr-2'>
          <p className='mb-3 text-gray-600 italic'>
            Các role hệ thống mặc định (Admin, Member) của hệ thống. Bạn không thể xóa hay thay đổi role hệ thống.
          </p>
          <PermissionMatrix roles={systemRoles} />
        </TabPanel>

        <TabPanel header='Project Role' leftIcon='pi pi-briefcase mr-2'>
          <ProjectRoleCom />
        </TabPanel>
      </TabView>
    </ContentLayout>
  )
}
