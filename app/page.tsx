"use client"

import type React from "react"

import { useState } from "react"
import { Upload, Download, RotateCcw, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"

const defaultFaces = [
  { id: 1, name: "Face 1", src: "/images/face1.png" },
  { id: 2, name: "Face 2", src: "/images/face2.png" },
  { id: 3, name: "Face 3", src: "/placeholder.svg?height=200&width=200" },
  { id: 4, name: "Face 4", src: "/placeholder.svg?height=200&width=200" },
  { id: 5, name: "Face 5", src: "/placeholder.svg?height=200&width=200" },
  { id: 6, name: "Face 6", src: "/placeholder.svg?height=200&width=200" },
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

export default function FaceGenerator() {
  const [selectedFace, setSelectedFace] = useState<number | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
        setSelectedFace(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFaceSelect = (faceId: number) => {
    setSelectedFace(faceId)
    setUploadedImage(null)
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

  const generateFace = async () => {
    if (!selectedFace && !uploadedImage) return

    setIsGenerating(true)
    setError(null)

    try {
      // Convert attribute values to API format
      const apiAttributes = Object.entries(attributeValues).reduce((acc, [key, value]) => {
        acc[key] = mapValueToApiRange(value)
        return acc
      }, {} as Record<string, number>)

      const formData = new FormData()
      if (selectedFace) {
        formData.append('face_form', selectedFace.toString())
      }
      formData.append('attrs', JSON.stringify(apiAttributes))

      const response = await fetch('https://aiclub.uit.edu.vn/face_generator_api/face_gen', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to generate face')
      }

      const blob = await response.blob()
      const imageUrl = URL.createObjectURL(blob)
      setGeneratedImage(imageUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error generating face:', err)
    } finally {
      setIsGenerating(false)
    }
  }

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
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Face Generator</h1>
          <p className="text-lg text-gray-600">
            Upload a face or choose a default, then customize attributes to generate new faces
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Input and Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Face Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Choose Your Base Face</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="upload" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload">Upload Image</TabsTrigger>
                    <TabsTrigger value="default">Default Faces</TabsTrigger>
                  </TabsList>

                  <TabsContent value="upload" className="space-y-4">
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
                        <p className="text-lg font-medium text-gray-900">Upload your image</p>
                        <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                      </label>
                    </div>
                    {uploadedImage && (
                      <div className="flex justify-center">
                        <div className="w-32 h-32 rounded-lg overflow-hidden">
                          <img
                            src={uploadedImage || "/placeholder.svg"}
                            alt="Uploaded"
                            className="w-full h-full object-cover"
                          />
                        </div>
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
                <CardTitle>Customize Attributes</CardTitle>
                <Button variant="outline" size="sm" onClick={resetAttributes}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset All
                </Button>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="hair" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="hair">Hair</TabsTrigger>
                    <TabsTrigger value="facial">Facial</TabsTrigger>
                    <TabsTrigger value="facial_hair">Facial Hair</TabsTrigger>
                    <TabsTrigger value="makeup_accessories">Makeup & Accessories</TabsTrigger>
                    <TabsTrigger value="general">General</TabsTrigger>
                  </TabsList>

                  {Object.entries(attributes).map(([category, attrs]) => (
                    <TabsContent key={category} value={category} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {attrs.map((attr) => (
                          <div key={attr} className="space-y-2">
                            <div className="flex justify-between">
                              <Label htmlFor={attr} className="text-sm font-medium">
                                {formatAttributeName(attr)}
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
                <CardTitle>Generated Result</CardTitle>
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
                      alt="Generated face"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-center text-gray-500">
                      <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                      <p>Generated face will appear here</p>
                    </div>
                  )}
                </div>

                <Button
                  onClick={generateFace}
                  disabled={(!selectedFace && !uploadedImage) || isGenerating}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Face"
                  )}
                </Button>

                {generatedImage && (
                  <Button variant="outline" className="w-full" onClick={handleDownload}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Result
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Current Settings Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Active Attributes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {Object.entries(attributeValues)
                    .filter(([_, value]) => value !== 50)
                    .sort(([_, a], [__, b]) => Math.abs(b - 50) - Math.abs(a - 50))
                    .slice(0, 10)
                    .map(([attr, value]) => (
                      <div key={attr} className="flex justify-between text-sm">
                        <span>{formatAttributeName(attr)}</span>
                        <span className={value > 50 ? "text-primary" : "text-purple-600"}>{value}</span>
                      </div>
                    ))}
                  {Object.values(attributeValues).every((v) => v === 50) && (
                    <p className="text-sm text-gray-500 text-center">All attributes at default (50)</p>
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
