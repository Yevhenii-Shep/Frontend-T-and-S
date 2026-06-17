import { ref } from 'vue'
import api from '@/api/axios'
import { alertApiError } from '@/composables/useProjectActions'

export const useProjectDocuments = (getProject: () => any, refresh: () => Promise<void>) => {
  const docFile = ref<File | null>(null)
  const docName = ref('')
  const uploadingDoc = ref(false)

  const onDocFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement
    docFile.value = input.files?.[0] || null
  }

  const uploadDocument = async () => {
    const project = getProject()
    if (!project || !docFile.value) return

    uploadingDoc.value = true

    try {
      const formData = new FormData()
      formData.append('file', docFile.value)
      formData.append('project_id', String(project.id))
      if (docName.value) {
        formData.append('name', docName.value)
      }

      await api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      docFile.value = null
      docName.value = ''
      await refresh()
    } catch (error) {
      alertApiError(error, 'Failed to upload document')
    } finally {
      uploadingDoc.value = false
    }
  }

  const downloadDocument = async (docId: number, name: string) => {
    try {
      const res = await api.get(`/documents/${docId}/download`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.download = name
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      alertApiError(error, 'Failed to download document')
    }
  }

  const deleteDocument = async (docId: number) => {
    if (!confirm('Delete this document?')) return

    try {
      await api.delete(`/documents/${docId}`)
      await refresh()
    } catch (error) {
      alertApiError(error, 'Failed to delete document')
    }
  }

  return {
    docFile,
    docName,
    uploadingDoc,
    onDocFileChange,
    uploadDocument,
    downloadDocument,
    deleteDocument,
  }
}
