import type { Project } from '../../../types/project'

import api from '../../../util/axiosClient'

export const getPermissionAPI = async () => {
  const response = await api.get(`/permission/project`)
  return response.data
}
