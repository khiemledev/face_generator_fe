"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Upload, Download, FileText, Eye, Zap, ExternalLink, Database, FileOutput, Layers } from "lucide-react"
import Image from "next/image"

const sampleFiles = [
  {
    name: "Administrative Order #001.pdf",
    path: "/samples/administrative-order-001.pdf",
    description: "Official administrative order regarding new policies",
    size: "245 KB",
    pages: 3,
  },
  {
    name: "Meeting Minutes - Board.pdf",
    path: "/samples/meeting-minutes-board.pdf",
    description: "Board meeting minutes from quarterly review",
    size: "189 KB",
    pages: 5,
  },
  {
    name: "Policy Document v2.1.pdf",
    path: "/samples/policy-document-v2.pdf",
    description: "Updated organizational policy document",
    size: "312 KB",
    pages: 8,
  },
  {
    name: "Budget Report Q3.pdf",
    path: "/samples/budget-report-q3.pdf",
    description: "Third quarter financial budget report",
    size: "156 KB",
    pages: 4,
  },
  {
    name: "Staff Memo - Updates.pdf",
    path: "/samples/staff-memo-updates.pdf",
    description: "Internal staff communication memo",
    size: "98 KB",
    pages: 2,
  },
  {
    name: "Project Proposal Draft.pdf",
    path: "/samples/project-proposal-draft.pdf",
    description: "Draft proposal for new project initiative",
    size: "278 KB",
    pages: 6,
  },
]

const tabs = [
  {
    id: "extraction",
    label: "Information Extraction",
    icon: Database,
    description: "Extract key data from documents",
  },
  {
    id: "conversion",
    label: "PDF to Word",
    icon: FileOutput,
    description: "Convert PDF to editable format",
  },
  {
    id: "textlayer",
    label: "Add Text Layer",
    icon: Layers,
    description: "Make PDFs searchable with OCR",
  },
]

export default function SmartExtractDemo() {
  const [activeTab, setActiveTab] = useState("extraction")
  const [selectedFile, setSelectedFile] = useState("")
  const [selectedFileData, setSelectedFileData] = useState<(typeof sampleFiles)[0] | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const handleFileSelect = (fileName: string) => {
    setSelectedFile(fileName)
    const fileData = sampleFiles.find((f) => f.name === fileName)
    setSelectedFileData(fileData || null)
    setShowResults(false)
  }

  const handleProcess = () => {
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      setShowResults(true)
    }, 2000)
  }

  const extractionResults = {
    "Issuing Authority": "Ministry of Education",
    "Document Number": "MOE-2024-001",
    "Date of Issue": "March 15, 2024",
    "Document Type": "Administrative Order",
    Summary: "Guidelines for implementing new educational standards across all institutions",
    "Signatory's Position": "Director General",
    "Signatory Name": "Dr. Sarah Johnson",
    Recipients: "All Educational Institutions",
    "Confidentiality Level": "Public",
    "Urgency Level": "Medium",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">UIT-AIClub SmartExtract</h1>
              <p className="text-sm text-gray-600">AI-Powered Document Processing Demo</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Modern Tab Navigation */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-2 p-1 bg-gray-100 rounded-xl">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center gap-3 px-6 py-4 rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-white text-black shadow-sm border border-gray-200"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">{tab.label}</div>
                    <div className="text-xs text-gray-500 hidden sm:block">{tab.description}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Information Extraction Tab */}
        {activeTab === "extraction" && (
          <div className="space-y-6">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Database className="w-5 h-5" />
                  Information Extraction from Administrative Documents
                </CardTitle>
                <CardDescription>
                  Extract key information from administrative documents automatically using AI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Illustration */}
                <div className="flex justify-center">
                  <Image
                    src="/placeholder.svg?height=200&width=400"
                    alt="Information extraction process illustration"
                    width={400}
                    height={200}
                    className="rounded-lg border border-gray-200"
                  />
                </div>

                {/* File Input Section */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Upload Document</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Drop your PDF file here or</p>
                      <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                        Browse Files
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-medium">Or Select Sample File</Label>
                    <Select value={selectedFile} onValueChange={handleFileSelect}>
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Choose a sample document" />
                      </SelectTrigger>
                      <SelectContent>
                        {sampleFiles.map((file, index) => (
                          <SelectItem key={index} value={file.name}>
                            <div className="flex flex-col items-start">
                              <span className="font-medium">{file.name}</span>
                              <span className="text-xs text-gray-500">{file.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {selectedFileData && (
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{selectedFileData.name}</p>
                          <a
                            href={selectedFileData.path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                        <p className="text-xs text-gray-600">{selectedFileData.description}</p>
                        <div className="flex gap-4 text-xs text-gray-500">
                          <span>Size: {selectedFileData.size}</span>
                          <span>Pages: {selectedFileData.pages}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleProcess}
                  disabled={!selectedFile || isProcessing}
                  className="w-full bg-black hover:bg-gray-800 text-white"
                >
                  {isProcessing ? "Processing..." : "Extract Information"}
                </Button>

                {/* Results Section */}
                {showResults && (
                  <div className="space-y-4">
                    <Separator />
                    <h3 className="text-lg font-semibold text-gray-900">Extracted Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {Object.entries(extractionResults).map(([key, value]) => (
                        <div key={key} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <Label className="text-sm font-medium text-gray-700">{key}</Label>
                          <p className="text-sm mt-1">{value}</p>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
                      <Download className="w-4 h-4 mr-2" />
                      Download Results as JSON
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* PDF to Word Conversion Tab */}
        {activeTab === "conversion" && (
          <div className="space-y-6">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <FileOutput className="w-5 h-5" />
                  PDF to Word Conversion
                </CardTitle>
                <CardDescription>
                  Convert PDF documents to editable Word format while preserving formatting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Illustration */}
                <div className="flex justify-center">
                  <Image
                    src="/placeholder.svg?height=200&width=400"
                    alt="PDF to Word conversion process"
                    width={400}
                    height={200}
                    className="rounded-lg border border-gray-200"
                  />
                </div>

                {/* File Input Section */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Upload PDF Document</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Drop your PDF file here or</p>
                      <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                        Browse Files
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-medium">Or Select Sample File</Label>
                    <Select onValueChange={handleFileSelect}>
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Choose a sample document" />
                      </SelectTrigger>
                      <SelectContent>
                        {sampleFiles.map((file, index) => (
                          <SelectItem key={index} value={file.name}>
                            <div className="flex flex-col items-start">
                              <span className="font-medium">{file.name}</span>
                              <span className="text-xs text-gray-500">{file.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {selectedFileData && (
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{selectedFileData.name}</p>
                          <a
                            href={selectedFileData.path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                        <p className="text-xs text-gray-600">{selectedFileData.description}</p>
                        <div className="flex gap-4 text-xs text-gray-500">
                          <span>Size: {selectedFileData.size}</span>
                          <span>Pages: {selectedFileData.pages}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Preview Section */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Original PDF Preview</Label>
                    <div className="h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      {selectedFileData ? (
                        <div className="text-center">
                          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 font-medium">{selectedFileData.name}</p>
                          <p className="text-xs text-gray-500">
                            {selectedFileData.pages} pages • {selectedFileData.size}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => window.open(selectedFileData.path, "_blank")}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View PDF
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center text-gray-500">
                          <Eye className="w-8 h-8 mx-auto mb-2" />
                          <p>Select a file to preview</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Converted Word Preview</Label>
                    <div className="h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <FileText className="w-8 h-8 mx-auto mb-2" />
                        <p>Word document preview will appear here</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button className="flex-1 bg-black hover:bg-gray-800 text-white" disabled={!selectedFile}>
                    Convert to Word
                  </Button>
                  <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Add Text Layer Tab */}
        {activeTab === "textlayer" && (
          <div className="space-y-6">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Layers className="w-5 h-5" />
                  Add Text Layer to PDF
                </CardTitle>
                <CardDescription>
                  Add searchable text layer to existing PDF documents using OCR technology
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Illustration */}
                <div className="flex justify-center">
                  <Image
                    src="/placeholder.svg?height=200&width=400"
                    alt="Text layer addition process"
                    width={400}
                    height={200}
                    className="rounded-lg border border-gray-200"
                  />
                </div>

                {/* File Input Section */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Upload PDF Document</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Drop your PDF file here or</p>
                      <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                        Browse Files
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-medium">Or Select Sample File</Label>
                    <Select onValueChange={handleFileSelect}>
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Choose a sample document" />
                      </SelectTrigger>
                      <SelectContent>
                        {sampleFiles.map((file, index) => (
                          <SelectItem key={index} value={file.name}>
                            <div className="flex flex-col items-start">
                              <span className="font-medium">{file.name}</span>
                              <span className="text-xs text-gray-500">{file.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {selectedFileData && (
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{selectedFileData.name}</p>
                          <a
                            href={selectedFileData.path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                        <p className="text-xs text-gray-600">{selectedFileData.description}</p>
                        <div className="flex gap-4 text-xs text-gray-500">
                          <span>Size: {selectedFileData.size}</span>
                          <span>Pages: {selectedFileData.pages}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Indicators */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="bg-gray-200 text-gray-700">
                        Before
                      </Badge>
                      <span className="text-sm font-medium">Original PDF</span>
                    </div>
                    <p className="text-sm text-gray-600">Image-based content, not searchable</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-black text-white">After</Badge>
                      <span className="text-sm font-medium">Enhanced PDF</span>
                    </div>
                    <p className="text-sm text-gray-700">Searchable text layer added</p>
                  </div>
                </div>

                {/* Preview Section */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Original PDF</Label>
                    <div className="h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      {selectedFileData ? (
                        <div className="text-center">
                          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 font-medium">{selectedFileData.name}</p>
                          <p className="text-xs text-gray-500">
                            {selectedFileData.pages} pages • {selectedFileData.size}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => window.open(selectedFileData.path, "_blank")}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View PDF
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center text-gray-500">
                          <Eye className="w-8 h-8 mx-auto mb-2" />
                          <p>Select a file to preview</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Enhanced PDF</Label>
                    <div className="h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <FileText className="w-8 h-8 mx-auto mb-2" />
                        <p>Enhanced PDF with text layer</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button className="flex-1 bg-black hover:bg-gray-800 text-white" disabled={!selectedFile}>
                    Add Text Layer
                  </Button>
                  <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                    <Download className="w-4 h-4 mr-2" />
                    Download Enhanced PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>© 2024 UIT-AIClub SmartExtract - AI-Powered Document Processing Demo</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
