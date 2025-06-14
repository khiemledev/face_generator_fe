"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Upload, Download, RotateCcw, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { LanguageProvider } from "./contexts/LanguageContext"
import { LanguageSelector } from "./components/LanguageSelector"
import { useLanguage } from "./contexts/LanguageContext"
import { getTranslation } from "./utils/translations"
import { faceGeneratorAPI } from "./utils/api"
import { AxiosError } from "axios"

const defaultFaces = [
  { id: 1, name: "Face 1", src: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/images/face1.png` },
  { id: 2, name: "Face 2", src: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/images/face2.png` },
  { id: 3, name: "Face 3", src: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/images/face3.png` },
  { id: 4, name: "Face 4", src: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/images/face4.png` },
  { id: 5, name: "Face 5", src: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/images/face5.png` },
  { id: 6, name: "Face 6", src: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/images/face6.png` },
]

const attributes = {
  hair: [
    "Black_Hair",
    "Blond_Hair",
    "Brown_Hair",
    "Gray_Hair",
    "Bald",
    "Bangs",
    "Receding_Hairline",
    "Straight_Hair",
    "Wavy_Hair",
  ],
  facial: [
    "Arched_Eyebrows",
    "Bushy_Eyebrows",
    "Big_Lips",
    "Big_Nose",
    "Pointy_Nose",
    "Narrow_Eyes",
    "High_Cheekbones",
    "Chubby",
    "Double_Chin",
    "Oval_Face",
    "Mouth_Slightly_Open",
    "Smiling",
  ],
  facial_hair: ["5_o_Clock_Shadow", "Goatee", "Mustache", "No_Beard", "Sideburns"],
  makeup_accessories: [
    "Heavy_Makeup",
    "Wearing_Lipstick",
    "Eyeglasses",
    "Wearing_Earrings",
    "Wearing_Hat",
    "Wearing_Necklace",
    "Wearing_Necktie",
  ],
  general: ["Attractive", "Bags_Under_Eyes", "Blurry", "Male", "Pale_Skin", "Rosy_Cheeks", "Young"],
}

function FaceGeneratorContent() {
  const { language } = useLanguage()
  const t = (key: string) => getTranslation(language, key)

  const [selectedFace, setSelectedFace] = useState<number | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [textPrompt, setTextPrompt] = useState<string>('')
  const [numSteps, setNumSteps] = useState<number>(20)
  const [generatedFromText, setGeneratedFromText] = useState<string | null>(null)
  const [isGeneratingFromText, setIsGeneratingFromText] = useState(false)
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null)
  const [taskStatus, setTaskStatus] = useState<string>('')
  const [attributeValues, setAttributeValues] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {}
    Object.values(attributes)
      .flat()
      .forEach((attr) => {
        initial[attr] = 50
      })
    return initial
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [faceTaskId, setFaceTaskId] = useState<string | null>(null)
  const [faceTaskStatus, setFaceTaskStatus] = useState<string>('')

  // Cleanup polling when component unmounts or task changes
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)
  const [facePollingInterval, setFacePollingInterval] = useState<NodeJS.Timeout | null>(null)

  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval)
      setPollingInterval(null)
    }
  }

  const stopFacePolling = () => {
    if (facePollingInterval) {
      clearInterval(facePollingInterval)
      setFacePollingInterval(null)
    }
  }

  const checkTaskStatus = async (taskId: string): Promise<boolean> => {
    try {
      const response = await faceGeneratorAPI.checkPromptStatus(taskId)
      
      const contentType = response.headers['content-type']
      
      if (contentType && contentType.includes('application/json')) {
        // Task not complete or error - parse the blob as JSON
        const text = await (response.data as Blob).text()
        const statusData = JSON.parse(text)
        console.log('Task status:', statusData)
        
        // Update status message for user feedback
        if (statusData.status === 'PENDING') {
          setTaskStatus(t('status.processing'))
        } else if (statusData.status === 'ERROR') {
          setTaskStatus('')
          setError(statusData.message || t('errors.textPromptFailed'))
          return true // Stop polling on error
        } else {
          setTaskStatus(statusData.message || t('status.processing'))
        }
        
        return false // Continue polling
      } else {
        // Binary response - task completed successfully
        const blob = response.data as Blob
        const imageUrl = URL.createObjectURL(blob)
        setGeneratedFromText(imageUrl)
        setSelectedFace(null)
        setUploadedImage(null)
        setTaskStatus('')
        return true // Stop polling
      }
    } catch (err) {
      console.error('Error checking task status:', err)
      const errorMessage = err instanceof AxiosError 
        ? err.response?.data?.message || err.message 
        : t('errors.textPromptFailed')
      setError(errorMessage)
      setTaskStatus('')
      return true // Stop polling on error
    }
  }

  const handleGenerateFromText = async () => {
    if (!textPrompt.trim()) return

    // Stop any existing polling
    stopPolling()

    setIsGeneratingFromText(true)
    setError(null)
    setCurrentTaskId(null)
    setTaskStatus('')

    try {
      // Submit the generation task
      const response = await faceGeneratorAPI.generateFromPrompt(textPrompt, numSteps)

      const result = response.data
      const taskId = result.task_id

      if (!taskId) {
        throw new Error('No task ID received')
      }

      setCurrentTaskId(taskId)
      setTaskStatus(t('status.submittingToQueue'))

      // Start polling for status
      const interval = setInterval(async () => {
        const isComplete = await checkTaskStatus(taskId)
        if (isComplete) {
          clearInterval(interval)
          setPollingInterval(null)
          setIsGeneratingFromText(false)
          setCurrentTaskId(null)
          setTaskStatus('')
        }
      }, 2000) // Poll every 2 seconds

      setPollingInterval(interval)

    } catch (err) {
      const errorMessage = err instanceof AxiosError 
        ? err.response?.data?.message || err.message 
        : t('errors.textPromptFailed')
      setError(errorMessage)
      console.error('Error generating image from text:', err)
      setIsGeneratingFromText(false)
      setCurrentTaskId(null)
      setTaskStatus('')
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling()
    }
  }, [])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
        setSelectedFace(null)
        setGeneratedFromText(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFaceSelect = (faceId: number) => {
    setSelectedFace(faceId)
    setUploadedImage(null)
    setGeneratedFromText(null)
  }

  const handleAttributeChange = (attribute: string, value: number[]) => {
    setAttributeValues((prev) => ({
      ...prev,
      [attribute]: value[0],
    }))
  }

  const handleDownload = () => {
    if (!generatedImage) return

    // Create a temporary link element
    const link = document.createElement('a')
    link.href = generatedImage
    link.download = `generated-face-${new Date().getTime()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const mapValueToApiRange = (value: number): number => {
    // Map from 0-100 to -1 to 1
    return (value / 50) - 1
  }

  const checkFaceTaskStatus = async (taskId: string): Promise<boolean> => {
    try {
      const response = await faceGeneratorAPI.checkUploadStatus(taskId)
      
      const contentType = response.headers['content-type']
      
      if (contentType && contentType.includes('application/json')) {
        // Task not complete or error - parse the blob as JSON
        const text = await (response.data as Blob).text()
        const statusData = JSON.parse(text)
        console.log('Face task status:', statusData)
        
        // Update status message for user feedback
        if (statusData.status === 'PENDING') {
          setFaceTaskStatus(t('status.processingFaceAttributes'))
        } else if (statusData.status === 'ERROR') {
          setFaceTaskStatus('')
          setError(statusData.message || t('errors.generateFailed'))
          return true // Stop polling on error
        } else {
          setFaceTaskStatus(statusData.message || t('status.processingFaceAttributes'))
        }
        
        return false // Continue polling
      } else {
        // Binary response - task completed successfully
        const blob = response.data as Blob
        const imageUrl = URL.createObjectURL(blob)
        setGeneratedImage(imageUrl)
        setFaceTaskStatus('')
        return true // Stop polling
      }
    } catch (err) {
      console.error('Error checking face task status:', err)
      const errorMessage = err instanceof AxiosError 
        ? err.response?.data?.message || err.message 
        : t('errors.generateFailed')
      setError(errorMessage)
      setFaceTaskStatus('')
      return true // Stop polling on error
    }
  }

  const generateFace = async () => {
    if (!selectedFace && !uploadedImage && !generatedFromText) return

    // Stop any existing face polling
    stopFacePolling()

    setIsGenerating(true)
    setError(null)
    setFaceTaskId(null)
    setFaceTaskStatus('')

    try {
      // Convert attribute values to API format
      const apiAttributes = Object.entries(attributeValues).reduce((acc, [key, value]) => {
        acc[key] = mapValueToApiRange(value)
        return acc
      }, {} as Record<string, number>)

      if (selectedFace) {
        // Use default face - use the synchronous API
        const response = await faceGeneratorAPI.generateWithDefaultFace(selectedFace, apiAttributes)
        
        const blob = response.data
        const imageUrl = URL.createObjectURL(blob)
        setGeneratedImage(imageUrl)
        setIsGenerating(false)
        return
      }

      // For uploaded images and generated from text, use the queue-based API
      let imageBlob: Blob
      let filename: string

      if (uploadedImage) {
        // Convert base64 to blob
        const base64Response = await fetch(uploadedImage)
        imageBlob = await base64Response.blob()
        filename = 'uploaded_image.png'
      } else if (generatedFromText) {
        // Use generated from text image
        const base64Response = await fetch(generatedFromText)
        imageBlob = await base64Response.blob()
        filename = 'generated_from_text.png'
      } else {
        throw new Error(t('errors.selectOrUpload'))
      }

      const response = await faceGeneratorAPI.generateWithUploadedImage(imageBlob, apiAttributes, filename)

      const result = response.data
      const taskId = result.task_id

      if (!taskId) {
        throw new Error('No task ID received for face generation')
      }

      setFaceTaskId(taskId)
      setFaceTaskStatus(t('status.submittingFaceGeneration'))

      // Start polling for status
      const interval = setInterval(async () => {
        const isComplete = await checkFaceTaskStatus(taskId)
        if (isComplete) {
          clearInterval(interval)
          setFacePollingInterval(null)
          setIsGenerating(false)
          setFaceTaskId(null)
          setFaceTaskStatus('')
        }
      }, 2000) // Poll every 2 seconds

      setFacePollingInterval(interval)

    } catch (err) {
      const errorMessage = err instanceof AxiosError 
        ? err.response?.data?.message || err.message 
        : 'An error occurred'
      setError(errorMessage)
      console.error('Error generating face:', err)
      setIsGenerating(false)
      setFaceTaskId(null)
      setFaceTaskStatus('')
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling()
      stopFacePolling()
    }
  }, [])

  const resetAttributes = () => {
    const reset: Record<string, number> = {}
    Object.values(attributes)
      .flat()
      .forEach((attr) => {
        reset[attr] = 50
      })
    setAttributeValues(reset)
  }

  const formatAttributeName = (attr: string) => {
    return attr.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-50 p-4">
      <LanguageSelector />
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('title')}</h1>
          <p className="text-lg text-gray-600">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Input and Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Face Selection */}
            <Card>
              <CardHeader>
                <CardTitle>{t('chooseFace')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="textPrompt" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="textPrompt">{t('textPrompt')}</TabsTrigger>
                    <TabsTrigger value="upload">{t('uploadImage')}</TabsTrigger>
                    <TabsTrigger value="default">{t('defaultFaces')}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="textPrompt" className="space-y-4">
                    <div className="space-y-4">
                      <textarea
                        value={textPrompt}
                        onChange={(e) => setTextPrompt(e.target.value)}
                        placeholder={t('promptPlaceholder')}
                        className="w-full min-h-[100px] p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label className="text-sm font-medium">
                            {t('numSteps')}
                          </Label>
                          <span className="text-sm text-gray-500">{numSteps}</span>
                        </div>
                        <Slider
                          min={10}
                          max={50}
                          step={1}
                          value={[numSteps]}
                          onValueChange={(value) => setNumSteps(value[0])}
                          className="w-full"
                        />
                        <p className="text-xs text-gray-500">{t('numStepsHint')}</p>
                      </div>

                      <Button
                        onClick={handleGenerateFromText}
                        disabled={!textPrompt.trim() || isGeneratingFromText}
                        className="w-full"
                      >
                        {isGeneratingFromText ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {taskStatus || t('generatingFromText')}
                          </>
                        ) : (
                          t('generateFromText')
                        )}
                      </Button>
                    </div>

                    {generatedFromText && (
                      <div className="mt-4 space-y-2">
                        <div className="relative flex justify-center">
                          <div className="w-48 h-48 rounded-lg overflow-hidden">
                            <img
                              src={generatedFromText}
                              alt="Generated from text"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleGenerateFromText}
                            disabled={isGeneratingFromText}
                          >
                            <Loader2 className={`h-4 w-4 mr-2 ${isGeneratingFromText ? 'animate-spin' : ''}`} />
                            {t('regenerate')}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setGeneratedFromText(null)
                              setTextPrompt('')
                              setNumSteps(20)
                            }}
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            {t('resetAll')}
                          </Button>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="upload" className="space-y-4">
                    {uploadedImage ? (
                      <div className="relative flex justify-center">
                        <div className="w-48 h-48 rounded-lg overflow-hidden">
                          <img
                            src={uploadedImage}
                            alt="Uploaded"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute top-2 right-2 flex gap-2">
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 bg-white/90 hover:bg-white"
                            onClick={() => {
                              setUploadedImage(null)
                              // Reset the file input
                              const fileInput = document.getElementById('file-upload') as HTMLInputElement
                              if (fileInput) fileInput.value = ''
                            }}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 bg-white/90 hover:bg-white"
                            onClick={() => document.getElementById('file-upload')?.click()}
                          >
                            <Upload className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-lg font-medium text-gray-900">{t('uploadPrompt')}</p>
                          <p className="text-sm text-gray-500">{t('uploadHint')}</p>
                      </label>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="default">
                    <div className="grid grid-cols-3 gap-4">
                      {defaultFaces.map((face) => (
                        <div
                          key={face.id}
                          className={`cursor-pointer rounded-lg border-2 p-2 transition-all ${
                            selectedFace === face.id
                              ? "border-primary bg-primary/10"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => handleFaceSelect(face.id)}
                        >
                          <div className="aspect-square w-full overflow-hidden rounded">
                          <img
                            src={face.src || "/placeholder.svg"}
                            alt={face.name}
                              className="w-full h-full object-cover"
                          />
                          </div>
                          <p className="text-sm text-center mt-2">{face.name}</p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Attribute Controls */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t('customizeAttributes')}</CardTitle>
                <Button variant="outline" size="sm" onClick={resetAttributes}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {t('resetAll')}
                </Button>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="hair" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    {Object.keys(attributes).map((category) => (
                      <TabsTrigger key={category} value={category}>
                        {t(`categories.${category}`)}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {Object.entries(attributes).map(([category, attrs]) => (
                    <TabsContent key={category} value={category} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {attrs.map((attr) => (
                          <div key={attr} className="space-y-2">
                            <div className="flex justify-between">
                              <Label htmlFor={attr} className="text-sm font-medium">
                                {t(`attributes.${attr}`)}
                              </Label>
                              <span className="text-sm text-gray-500">{attributeValues[attr]}</span>
                            </div>
                            <Slider
                              id={attr}
                              min={0}
                              max={100}
                              step={1}
                              value={[attributeValues[attr]]}
                              onValueChange={(value) => handleAttributeChange(attr, value)}
                              className="w-full"
                            />
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Result */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('generatedResult')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  {error ? (
                    <div className="text-center text-red-500">
                      <p>Error: {error}</p>
                    </div>
                  ) : generatedImage ? (
                    <img
                      src={generatedImage}
                      alt={t('generatedResult')}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-center text-gray-500">
                      <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                      <p>{t('placeholderText')}</p>
                    </div>
                  )}
                </div>

                <Button
                  onClick={generateFace}
                  disabled={(!selectedFace && !uploadedImage && !generatedFromText) || isGenerating}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {faceTaskStatus || t('generating')}
                    </>
                  ) : (
                    t('generateFace')
                  )}
                </Button>

                {generatedImage && (
                  <Button variant="outline" className="w-full" onClick={handleDownload}>
                    <Download className="w-4 h-4 mr-2" />
                    {t('downloadResult')}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Current Settings Summary */}
            <Card>
              <CardHeader>
                <CardTitle>{t('activeAttributes')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {Object.entries(attributeValues)
                    .filter(([_, value]) => value !== 50)
                    .sort(([_, a], [__, b]) => Math.abs(b - 50) - Math.abs(a - 50))
                    .slice(0, 10)
                    .map(([attr, value]) => (
                      <div key={attr} className="flex justify-between text-sm">
                        <span>{t(`attributes.${attr}`)}</span>
                        <span className={value > 50 ? "text-primary" : "text-purple-600"}>{value}</span>
                      </div>
                    ))}
                  {Object.values(attributeValues).every((v) => v === 50) && (
                    <p className="text-sm text-gray-500 text-center">{t('defaultAttributes')}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FaceGenerator() {
  return (
    <LanguageProvider>
      <FaceGeneratorContent />
    </LanguageProvider>
  )
}

