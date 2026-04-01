"use client"

import * as React from "react"
import { 
  Upload, 
  FileText, 
  UserPlus, 
  Download, 
  Check, 
  Loader2, 
  Trash2, 
  Plus, 
  FileSpreadsheet, 
  X,
  Settings2,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Files,
  ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type Contact = {
  id: string
  nome: string
  paroquia: string
  ano: string
  circulo: string
  telefone: string
}

export default function ContactExtractor() {
  const [state, setState] = React.useState<"idle" | "processing" | "ready">("idle")
  const [data, setData] = React.useState<Contact[]>([])
  const [fileName, setFileName] = React.useState<string>("lista-contatos")
  const [error, setError] = React.useState<string | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [showSettings, setShowSettings] = React.useState(false)
  const [showPreview, setShowPreview] = React.useState(false)
  
  // Pending files before extraction
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])
  
  // Export Settings
  const [maxNames, setMaxNames] = React.useState<number | "">("")
  const [nameSuffix, setNameSuffix] = React.useState<string>("")
  const [fileCount, setFileCount] = React.useState<number>(0)
  
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return
    
    const files = selectedFiles
    setError(null)
    setFileCount(files.length)
    
    // Set default filename from the first file name if not edited
    if (fileName === "lista-contatos" || fileName === "") {
      if (files.length > 1) {
        setFileName(`extração-múltipla-${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}`)
      } else {
        setFileName(files[0].name.replace(/\.[^/.]+$/, ""))
      }
    }
    
    setState("processing")
    
    try {
      const formData = new FormData()
      files.forEach(file => {
        formData.append("file", file)
      })
      
      const response = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Falha ao extrair contatos")
      }
      
      const result = await response.json()
      
      const mappedData = (Array.isArray(result) ? result : []).map((item: any, index: number) => ({
        id: (Date.now() + index).toString(),
        nome: item.nome || "",
        paroquia: item.paroquia || "",
        ano: item.ano?.toString() || "",
        circulo: item.circulo || "",
        telefone: item.telefone || "",
      }))
      
      setData(mappedData)
      setState("ready")
      setSelectedFiles([]) // Clear queue after success
    } catch (err: any) {
      console.error("Erro no upload:", err)
      setError(err.message || "Ocorreu um erro inesperado")
      setState("idle")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files])
    }
    // Reset value so the change event fires even if the same file is picked
    e.target.value = ""
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith("image/") || file.type === "application/pdf"
    )
    
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files])
    }
  }

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleEdit = (id: string, field: keyof Contact, value: string) => {
    setData(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item))
  }

  const handleAddRow = () => {
    const newId = (Date.now()).toString()
    setData(prev => [...prev, { id: newId, nome: "", paroquia: "", ano: "", circulo: "", telefone: "" }])
  }

  const handleDeleteRow = (id: string) => {
    setData(prev => prev.filter(item => item.id !== id))
  }

  const applyNameRules = (originalName: string) => {
    let name = originalName.trim()
    if (!name) return ""
    
    // Rule 1: Limit number of names
    if (maxNames !== "" && Number(maxNames) > 0) {
      const parts = name.split(/\s+/).filter(Boolean)
      name = parts.slice(0, Number(maxNames)).join(" ")
    }
    
    // Rule 2: Add suffix
    if (nameSuffix.trim()) {
      name = `${name} ${nameSuffix}`
    }
    
    return name
  }

  const getCírculoStyles = (circulo: string) => {
    const normalize = circulo.toLowerCase().trim()
    switch (normalize) {
      case "amarelo": return "bg-amber-500 text-white border-transparent"
      case "verde": return "bg-emerald-500 text-white border-transparent"
      case "vermelho": return "bg-red-500 text-white border-transparent"
      case "azul": return "bg-blue-500 text-white border-transparent"
      case "rosa": return "bg-pink-500 text-white border-transparent"
      case "laranja": return "bg-orange-500 text-white border-transparent"
      case "cinza": return "bg-slate-400 text-white border-transparent"
      case "ciano": return "bg-cyan-500 text-white border-transparent"
      case "preto": return "bg-slate-900 text-white border-transparent"
      case "branco": return "bg-white text-slate-900 border-slate-200"
      case "lima": return "bg-lime-500 text-slate-900 border-transparent transition-colors"
      case "roxo": return "bg-purple-600 text-white border-transparent"
      case "": return "bg-slate-50 text-slate-400 border-dashed border-slate-200"
      default: return "bg-slate-100 text-slate-900 border-transparent"
    }
  }

  const exportCSV = () => {
    const headers = "Nome,Paróquia,Ano,Círculo,Telefone\n"
    const csvContent = data.map(c => {
      const formattedName = applyNameRules(c.nome)
      return `"${formattedName}","${c.paroquia}","${c.ano}","${c.circulo}","${c.telefone}"`
    }).join("\n")
    const blob = new Blob(["\uFEFF" + headers + csvContent], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${fileName || "contatos"}.csv`
    a.click()
  }

  const exportVCard = () => {
    const vcardContent = data.map(c => {
      const formattedName = applyNameRules(c.nome) || "Contato Sem Nome"
      
      // Extrair partes do nome para o componente N (LastName;FirstName;MiddleName;Prefix;Suffix)
      const nameParts = formattedName.trim().split(/\s+/)
      const lastName = nameParts.length > 1 ? nameParts.pop() || "" : ""
      const firstName = nameParts.join(" ")
      
      // Montar a anotação (note) com todas as informações disponíveis usando quebra de linha literal do vCard (\n)
      const notas = [
        c.paroquia ? `Paróquia: ${c.paroquia}` : "",
        c.circulo ? `Círculo: ${c.circulo}` : "",
        c.ano ? `Ano: ${c.ano}` : ""
      ].filter(Boolean).join("\\n")
      
      // Especificação do VCF com campos requisitados (N, FN, TEL, NOTE)
      return [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${lastName};${firstName};;;`,
        `FN:${formattedName}`,
        `TEL;TYPE=CELL,VOICE:${c.telefone || ""}`,
        `NOTE:${notas || "Sem informações adicionais"}`,
        "END:VCARD"
      ].join("\n")
    }).join("\n")
    const blob = new Blob([vcardContent], { type: "text/vcard" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${fileName || "contatos"}.vcf`
    a.click()
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-slate-200">
      {/* Hidden File Input */}
      <input 
        type="file" 
        multiple
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*,.pdf" 
        className="hidden" 
      />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container flex h-14 items-center justify-between px-4 md:px-8 max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="size-8 bg-slate-900 rounded-lg flex items-center justify-center shadow-lg shadow-slate-200 transition-transform hover:scale-105">
              <FileSpreadsheet className="size-5 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-base font-bold tracking-tight leading-none group cursor-default">
                Grupo <span className="text-slate-400 font-medium">Fácil</span>
              </h1>
              <p className="text-[9px] text-slate-500 font-medium whitespace-nowrap mt-1 uppercase tracking-widest">Utilitário de extração inteligente</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="hidden md:flex text-slate-500 hover:text-slate-900 h-8">Documentação</Button>
            <div className="h-4 w-[1px] bg-slate-200 mx-2 hidden md:block" />
            <Button variant="outline" size="sm" className="h-8 border-slate-200 px-4 hover:bg-slate-50" onClick={() => { setData([]); setState("idle"); setError(null); setSelectedFiles([]); }}>Limpar Tudo</Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container max-w-6xl mx-auto py-8 md:py-10 px-4 md:px-8 space-y-10">
        {state === "idle" && (
          <section className="animate-in fade-in slide-in-from-top-4 duration-700 max-w-3xl mx-auto w-full pt-4">
            <div className="text-center space-y-4 mb-10">
              <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">Extraia contatos com facilidade</h2>
              <p className="text-slate-500 text-lg max-w-xl mx-auto leading-relaxed">
                Transforme imagens de listas em dados organizados e editáveis prontos para exportação.
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <Card 
                className={cn(
                  "border-2 border-dashed transition-all cursor-pointer group shadow-xl hover:shadow-2xl hover:-translate-y-1 duration-300 overflow-hidden relative rounded-[2rem]",
                  isDragging ? "border-slate-950 bg-slate-50 shadow-2xl scale-[1.02]" : "border-slate-200 bg-white hover:border-slate-950",
                  selectedFiles.length > 0 && "border-solid border-slate-100 bg-slate-50 shadow-none hover:-translate-y-0 hover:shadow-none"
                )}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <CardContent className={cn(
                  "flex flex-col items-center justify-center space-y-6 transition-all duration-500",
                  selectedFiles.length > 0 ? "py-10" : "py-20 md:py-28"
                )}>
                  <div className={cn(
                    "p-6 rounded-2xl transition-all duration-300 shadow-sm",
                    isDragging ? "bg-slate-950 text-white scale-110" : "bg-slate-50 group-hover:bg-slate-950 group-hover:text-white",
                    selectedFiles.length > 0 && "bg-white group-hover:bg-slate-100 group-hover:text-slate-900 shadow-none"
                  )}>
                    {selectedFiles.length > 0 ? <Plus className="size-8" /> : <Upload className="size-12" />}
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-xl font-bold text-slate-900">
                      {isDragging ? "Solte para Adicionar" : selectedFiles.length > 0 ? "Adicionar mais arquivos" : "Arraste suas imagens ou PDF aqui"}
                    </p>
                    <p className="text-sm text-slate-400 font-medium">PNG, JPG ou PDF de até 10MB por arquivo</p>
                  </div>
                  {!isDragging && selectedFiles.length === 0 && (
                    <Button className="mt-4 px-10 h-12 rounded-full font-bold shadow-xl transition-all active:scale-95 border-none bg-slate-900 text-white shadow-slate-200 hover:bg-slate-800 hover:text-white">
                      Selecionar Arquivos
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Lista de Arquivos Selecionados (Pendente) */}
              {selectedFiles.length > 0 && (
                <div className="animate-in slide-in-from-bottom-4 fade-in duration-500 space-y-6">
                  <div className="bg-white border border-slate-100 rounded-[2rem] shadow-xl shadow-slate-200/40 p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-900 rounded-xl p-2.5">
                          <Files className="size-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-black text-slate-900 text-lg">Arquivos Selecionados</h3>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">{selectedFiles.length} arquivos prontos para extrair</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 font-bold text-xs" onClick={() => setSelectedFiles([])}>Limpar Fila</Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                      {selectedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:shadow-md hover:border-slate-200">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="size-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 shrink-0">
                              <FileText className="size-5 text-slate-400" />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-[14px] font-bold text-slate-900 truncate">{file.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="size-8 text-slate-300 hover:text-red-500 hover:bg-transparent transition-colors opacity-0 group-hover:opacity-100" onClick={() => handleRemoveFile(idx)}>
                            <X className="size-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <Button 
                      onClick={handleUpload}
                      className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black text-lg gap-4 shadow-2xl shadow-slate-200 hover:bg-slate-800 hover:-translate-y-1 transition-all active:scale-95 group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      Começar Extração por IA <ArrowRight className="size-6 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                ⚠️ {error}
              </div>
            )}

            {selectedFiles.length === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 pt-12 border-t border-slate-100">
                {[
                  { title: "Alta Precisão", desc: "Detecção avançada de tabelas por IA." },
                  { title: "Categorização Inteligente", desc: "Cores automáticas para seus círculos." },
                  { title: "Pronto para Celular", desc: "Exporte vCards direto para seus contatos." }
                ].map((feature, i) => (
                  <div key={i} className="space-y-2 p-4 rounded-xl hover:bg-slate-50 transition-colors">
                    <h3 className="font-bold text-slate-900">{feature.title}</h3>
                    <p className="text-sm text-slate-500 leading-snug">{feature.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {state === "processing" && (
          <section className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto w-full pt-4">
            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="size-12 bg-slate-950 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200">
                  <Loader2 className="size-6 animate-spin text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight text-slate-900">
                    Processando {fileCount} {fileCount > 1 ? "arquivos" : "arquivo"}...
                  </h2>
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-wider text-[10px]">Extração consolidada por IA em curso</p>
                </div>
              </div>
              <Badge variant="secondary" className="px-4 h-8 bg-slate-900 text-white border-none font-black text-xs">PRONTO EM SEGUNDOS</Badge>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex flex-col gap-4 p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                  <Skeleton className="h-3 w-1/4 rounded-full" />
                  <div className="flex gap-4">
                    <Skeleton className="h-8 flex-[2] rounded-xl" />
                    <Skeleton className="h-8 flex-[1] rounded-xl" />
                    <Skeleton className="h-8 w-24 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {state === "ready" && (
          <section className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex items-center justify-between gap-4 flex-wrap pb-1">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-500 rounded-2xl p-2.5 shadow-lg shadow-emerald-100 transition-transform hover:scale-110">
                  <Check className="size-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight text-slate-900">Contatos Extraídos</h2>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                    {data.length} Resultados de {fileCount} {fileCount > 1 ? "arquivos" : "arquivo"}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="h-9 gap-2 font-bold border-slate-200 px-4 rounded-xl hover:bg-slate-50 shadow-sm" onClick={handleAddRow}>
                  <Plus className="size-3.5" /> Adicionar Linha
                </Button>
                <Button variant="outline" size="sm" className="h-9 gap-2 font-bold border-slate-200 px-4 rounded-xl hover:bg-slate-50 shadow-sm" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="size-3.5" /> Novo Upload
                </Button>
              </div>
            </div>

            {/* Configurações de Exportação */}
            <div className="border border-slate-100 bg-white rounded-3xl shadow-md overflow-hidden transition-all duration-300">
               <button 
                onClick={() => setShowSettings(!showSettings)}
                className="w-full flex items-center justify-between px-8 py-5 hover:bg-slate-50/50 transition-colors"
               >
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-slate-900 rounded-lg">
                    <Settings2 className="size-4 text-white" />
                   </div>
                   <div className="text-left">
                     <p className="text-sm font-black text-slate-900 uppercase tracking-wider">Configurações de Exportação</p>
                     <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Personalize o formato dos dados salvos</p>
                   </div>
                 </div>
                 {showSettings ? <ChevronUp className="size-5 text-slate-400" /> : <ChevronDown className="size-5 text-slate-400" />}
               </button>
               
               <div className={cn(
                 "grid grid-cols-1 md:grid-cols-3 gap-8 px-8 transition-all duration-500 overflow-hidden",
                 showSettings ? "pb-8 pt-2 opacity-100 max-h-96" : "max-h-0 opacity-0"
               )}>
                 <div className="space-y-3">
                   <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Nome do Arquivo</Label>
                   <div className="relative">
                     <Input 
                        value={fileName} 
                        onChange={(e) => setFileName(e.target.value)}
                        className="h-11 rounded-xl bg-slate-50/50 border-slate-100 focus:bg-white transition-all font-bold text-sm"
                        placeholder="nome-do-arquivo"
                     />
                     <div className="absolute right-3 top-3 text-[10px] font-black text-slate-300">.vcf / .csv</div>
                   </div>
                 </div>
                 
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Limite de Nomes</Label>
                    <div className="flex items-center gap-3">
                      <Input 
                        type="number"
                        value={maxNames} 
                        onChange={(e) => setMaxNames(e.target.value === "" ? "" : Number(e.target.value))}
                        className="h-11 rounded-xl bg-slate-50/50 border-slate-100 focus:bg-white transition-all font-bold text-sm"
                        placeholder="Ex: 2"
                      />
                      <div className="text-[10px] text-slate-400 font-bold leading-tight">Preservar apenas os primeiros X nomes</div>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Sufixo de Contato</Label>
                    <div className="flex items-center gap-3">
                      <Input 
                        value={nameSuffix} 
                        onChange={(e) => setNameSuffix(e.target.value)}
                        className="h-11 rounded-xl bg-slate-50/50 border-slate-100 focus:bg-white transition-all font-bold text-sm"
                        placeholder="Ex: (Grupo)"
                      />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={cn(
                          "h-11 px-4 rounded-xl font-bold text-[10px] uppercase gap-2 transition-all",
                          showPreview ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"
                        )}
                        onClick={() => setShowPreview(!showPreview)}
                      >
                        {showPreview ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                        {showPreview ? "Prévia ON" : "Prévia OFF"}
                      </Button>
                    </div>
                 </div>
               </div>
            </div>

            <div className="border border-slate-100 rounded-[2rem] bg-white shadow-2xl shadow-slate-200/40 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50/40 border-b border-slate-100">
                  <TableRow className="h-12 hover:bg-transparent">
                    <TableHead className="w-[220px] font-black text-slate-900 pl-12 text-[10px] uppercase tracking-widest">Nome</TableHead>
                    <TableHead className="font-black text-slate-900 text-[10px] uppercase tracking-widest text-center">Paróquia</TableHead>
                    <TableHead className="w-[100px] font-black text-slate-900 text-[10px] uppercase tracking-widest text-center">Ano</TableHead>
                    <TableHead className="w-[180px] font-black text-slate-900 text-[10px] uppercase tracking-widest text-center">Círculo</TableHead>
                    <TableHead className="text-right font-black text-slate-900 pr-12 text-[10px] uppercase tracking-widest">Telefone</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item) => (
                    <TableRow key={item.id} className="group transition-all hover:bg-slate-50/50 border-b border-slate-50 h-[4.5rem]">
                      <TableCell className="p-0 pl-12">
                        <div className="relative group/input">
                          <Input 
                            value={item.nome} 
                            placeholder="Nome completo..."
                            onChange={(e) => handleEdit(item.id, "nome", e.target.value)}
                            className={cn(
                              "border-b border-transparent focus:border-slate-900 focus:bg-white rounded-none h-12 pr-4 bg-transparent font-bold text-[15px] transition-all placeholder:text-slate-200 shadow-none focus-visible:ring-0",
                              showPreview && "text-slate-400"
                            )}
                          />
                          {showPreview && (
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-emerald-600 font-bold text-[15px] animate-in fade-in slide-in-from-left-2">
                              {applyNameRules(item.nome)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="p-0">
                        <Input 
                          value={item.paroquia} 
                          placeholder="Paróquia..."
                          onChange={(e) => handleEdit(item.id, "paroquia", e.target.value)}
                          className="border-b border-transparent focus:border-slate-900 focus:bg-white rounded-none h-12 px-4 bg-transparent text-center text-sm text-slate-600 transition-all placeholder:text-slate-200 shadow-none focus-visible:ring-0"
                        />
                      </TableCell>
                      <TableCell className="p-0">
                        <Input 
                          value={item.ano} 
                          placeholder="Ano..."
                          onChange={(e) => handleEdit(item.id, "ano", e.target.value)}
                          className="border-b border-transparent focus:border-slate-900 focus:bg-white rounded-none h-12 px-4 bg-transparent text-center font-mono text-sm text-slate-500 transition-all placeholder:text-slate-200 shadow-none focus-visible:ring-0"
                        />
                      </TableCell>
                      <TableCell className="px-6 py-0">
                        <div className={cn(
                          "relative flex items-center justify-center rounded-full border transition-all duration-300 h-9 shadow-sm",
                          getCírculoStyles(item.circulo)
                        )}>
                          <Input 
                            value={item.circulo} 
                            placeholder="Cor do círculo..."
                            onChange={(e) => handleEdit(item.id, "circulo", e.target.value)}
                            className="w-full h-full border-none focus:ring-0 bg-transparent text-center font-black text-[10px] uppercase tracking-[0.15em] placeholder:text-current/30 shadow-none focus-visible:ring-0"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right p-0 pr-12">
                        <Input 
                          value={item.telefone} 
                          placeholder="(00) 00000-0000"
                          onChange={(e) => handleEdit(item.id, "telefone", e.target.value)}
                          className="border-b border-transparent focus:border-slate-900 focus:bg-white rounded-none h-12 pl-4 px-0 bg-transparent text-right font-black font-mono text-sm transition-all placeholder:text-slate-200 shadow-none focus-visible:ring-0"
                        />
                      </TableCell>
                      <TableCell className="pr-6">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="size-9 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all transform hover:rotate-6 active:scale-95"
                          onClick={() => handleDeleteRow(item.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {data.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-40 text-center text-slate-400 italic">
                        <div className="flex flex-col items-center gap-3">
                          <X className="size-7 text-slate-200" />
                          <p className="text-sm font-medium">Nenhum contato encontrado</p>
                          <Button variant="outline" size="sm" className="mt-2 h-8" onClick={handleAddRow}>Começar do Zero</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </section>
        )}
      </main>

      {/* Action Bar */}
      {state === "ready" && (
        <div className="sticky bottom-0 z-50 border-t bg-white pt-5 pb-8 animate-in slide-in-from-bottom-full duration-700 shadow-[0_-15px_40px_rgba(0,0,0,0.03)] mt-auto">
          <div className="container max-w-6xl mx-auto px-4 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="hidden xs:flex size-10 bg-slate-50 rounded-xl items-center justify-center border border-slate-100">
                 <Download className="size-5 text-slate-900" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Pronto para Exportar</span>
                <span className="text-sm font-black text-slate-900 leading-none">{data.length} Contatos Verificados</span>
              </div>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button 
                variant="outline" 
                className="flex-1 sm:flex-none gap-2 h-12 px-8 border-2 border-slate-100 font-bold text-sm text-slate-900 hover:bg-slate-50 transition-all rounded-xl shadow-sm" 
                onClick={exportCSV}
              >
                <FileText className="size-4" /> CSV
              </Button>
              <Button 
                className="flex-1 sm:flex-none gap-2 h-12 px-8 bg-slate-900 border-none text-white font-bold text-sm shadow-xl shadow-slate-200 hover:bg-slate-800 rounded-xl transition-all hover:-translate-y-0.5 active:scale-95" 
                onClick={exportVCard}
              >
                <UserPlus className="size-4" /> Baixar vCard
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
