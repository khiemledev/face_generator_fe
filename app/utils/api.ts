import axios, { AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios'

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL || 'https://aiclub.uit.edu.vn/face_generator_api'}`,
  timeout: 300000, // 5 minutes timeout for long-running generation tasks
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`)
    return config
  },
  (error: AxiosError) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`Response received from ${response.config.url}:`, response.status)
    return response
  },
  (error: AxiosError) => {
    console.error('Response error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// API functions
export const faceGeneratorAPI = {
  // Text-to-image generation
  generateFromPrompt: async (prompt: string, numSteps: number) => {
    const formData = new URLSearchParams()
    formData.append('prompt', prompt)
    formData.append('num_step', numSteps.toString())

    return apiClient.post('/face_gen_prompt', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
  },

  // Check text-to-image status
  checkPromptStatus: async (taskId: string) => {
    return apiClient.get(`/face_gen_prompt_status?task_id=${taskId}`, {
      responseType: 'blob', // Handle both JSON and binary responses
      transformResponse: [(data: any) => data], // Don't transform response, handle it manually
    })
  },

  // Face generation with default faces
  generateWithDefaultFace: async (faceForm: number, attributes: Record<string, number>) => {
    const formData = new FormData()
    formData.append('face_form', faceForm.toString())
    formData.append('attrs', JSON.stringify(attributes))

    return apiClient.post('/face_gen', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'blob',
    })
  },

  // Face generation with uploaded image
  generateWithUploadedImage: async (imageBlob: Blob, attributes: Record<string, number>, filename: string = 'image.png') => {
    const formData = new FormData()
    formData.append('binary_file', imageBlob, filename)
    formData.append('attrs', JSON.stringify(attributes))

    return apiClient.post('/face_gen_upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // Check face generation status
  checkUploadStatus: async (taskId: string) => {
    return apiClient.get(`/face_gen_upload_status?task_id=${taskId}`, {
      responseType: 'blob', // Handle both JSON and binary responses
      transformResponse: [(data: any) => data], // Don't transform response, handle it manually
    })
  },
}

export default apiClient 