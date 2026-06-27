'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { ToastProvider, useToast } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase/client'
import {
  Plus,
  Edit2,
  Trash2,
  Upload,
  Sparkles,
  Package,
  HelpCircle,
  MessageSquare,
  FileText,
  Loader2,
  Globe,
  Save,
  Download,
} from 'lucide-react'

type TabId = 'products' | 'faq' | 'tone' | 'training'
type AiMode = 'suggestion' | 'semi_auto' | 'full_auto'
type DocStatus = 'pending' | 'processing' | 'completed' | 'failed'

interface Product {
  id: string
  name: string
  price: number
  stock: number
  description: string
  category: string
}

interface Faq {
  id: string
  question: string
  answer: string
}

interface TrainingDocument {
  id: string
  name: string
  type: string
  url: string | null
  file_name: string | null
  file_type: string | null
  file_url: string | null
  file_size: number | null
  status: DocStatus
  content: string | null
  created_at: string
}

interface ProductForm {
  name: string
  price: string
  stock: string
  description: string
  category: string
}

const EMPTY_PRODUCT: ProductForm = {
  name: '',
  price: '',
  stock: '0',
  description: '',
  category: '',
}

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'products', label: 'Produk & Harga', icon: Package },
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
  { id: 'tone', label: 'Cara Menjawab', icon: MessageSquare },
  { id: 'training', label: 'Data Training', icon: FileText },
]

const DOC_STATUS_LABEL: Record<DocStatus, string> = {
  pending: 'Menunggu',
  processing: 'Processing',
  completed: 'Selesai',
  failed: 'Gagal',
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price)
}

function AiTrainingContent() {
  const supabase = createClient()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const csvInputRef = useRef<HTMLInputElement>(null)

  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>('products')

  const [products, setProducts] = useState<Product[]>([])
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [documents, setDocuments] = useState<TrainingDocument[]>([])

  const [tone, setTone] = useState('')
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [aiMode, setAiMode] = useState<AiMode>('suggestion')
  const [businessName, setBusinessName] = useState('')

  const [productModalOpen, setProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productForm, setProductForm] = useState<ProductForm>(EMPTY_PRODUCT)

  const [editingFaqId, setEditingFaqId] = useState<string | null>(null)
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' })

  const [testQuestion, setTestQuestion] = useState('')
  const [testResult, setTestResult] = useState('')
  const [testLoading, setTestLoading] = useState(false)

  const [brandUrl, setBrandUrl] = useState('')
  const [scanLoading, setScanLoading] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)

  const loadData = useCallback(async (uid: string) => {
    setLoading(true)
    try {
      const [productsRes, faqsRes, trainingRes, docsRes] = await Promise.all([
        supabase.from('products').select('*').eq('user_id', uid).order('created_at'),
        supabase.from('faqs').select('*').eq('user_id', uid).order('created_at'),
        supabase.from('ai_training').select('*').eq('user_id', uid).maybeSingle(),
        supabase
          .from('ai_training_documents')
          .select('*')
          .eq('user_id', uid)
          .order('created_at', { ascending: false }),
      ])

      if (productsRes.error) throw productsRes.error
      if (faqsRes.error) throw faqsRes.error

      setProducts(productsRes.data ?? [])
      setFaqs(faqsRes.data ?? [])
      setDocuments(docsRes.data ?? [])

      if (trainingRes.data) {
        setTone(trainingRes.data.tone ?? '')
        setSpecialInstructions(trainingRes.data.special_instructions ?? '')
        setAiMode((trainingRes.data.ai_mode as AiMode) ?? 'suggestion')
        setBusinessName(trainingRes.data.business_name ?? '')
      }
    } catch (error) {
      toast({
        title: 'Gagal memuat data',
        description: error instanceof Error ? error.message : (error as any)?.message ?? 'Unknown error',
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }, [supabase, toast])

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      await loadData(user.id)
    }
    void init()
  }, [supabase, loadData])

  const ensureTraining = async (uid: string) => {
    await supabase.from('ai_training').upsert(
      {
        user_id: uid,
        tone,
        special_instructions: specialInstructions,
        ai_mode: aiMode,
        business_name: businessName,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )
  }

  const saveToneSettings = async () => {
    if (!userId) return
    setSaving(true)
    try {
      await ensureTraining(userId)
      toast({ title: 'Pengaturan AI disimpan', variant: 'success' })
    } catch (error) {
      toast({
        title: 'Gagal menyimpan',
        description: error instanceof Error ? error.message : (error as any)?.message,
        variant: 'error',
      })
    } finally {
      setSaving(false)
    }
  }

  const openProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      setProductForm({
        name: product.name,
        price: String(product.price),
        stock: String(product.stock),
        description: product.description,
        category: product.category,
      })
    } else {
      setEditingProduct(null)
      setProductForm(EMPTY_PRODUCT)
    }
    setProductModalOpen(true)
  }

  const saveProduct = async () => {
    if (!userId || !productForm.name.trim()) return
    setSaving(true)
    try {
      const payload = {
        user_id: userId,
        name: productForm.name.trim(),
        price: parseFloat(productForm.price) || 0,
        stock: parseInt(productForm.stock, 10) || 0,
        description: productForm.description.trim(),
        category: productForm.category.trim(),
        updated_at: new Date().toISOString(),
      }

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingProduct.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('products').insert(payload)
        if (error) throw error
      }

      setProductModalOpen(false)
      await loadData(userId)
      toast({
        title: editingProduct ? 'Produk diperbarui' : 'Produk ditambahkan',
        variant: 'success',
      })
    } catch (error) {
      toast({
        title: 'Gagal menyimpan produk',
        description: error instanceof Error ? error.message : (error as any)?.message,
        variant: 'error',
      })
    } finally {
      setSaving(false)
    }
  }

  const deleteProduct = async (id: string) => {
    if (!userId) return
    try {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error
      await loadData(userId)
      toast({ title: 'Produk dihapus', variant: 'success' })
    } catch (error) {
      toast({
        title: 'Gagal menghapus produk',
        description: error instanceof Error ? error.message : (error as any)?.message,
        variant: 'error',
      })
    }
  }

  const handleCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return

    try {
      const text = await file.text()
      const lines = text.split('\n').filter((l) => l.trim())
      const rows = lines.slice(1)

      const imports = rows.map((line) => {
        const [name, price, stock, description, category] = line
          .split(',')
          .map((s) => s.trim().replace(/^"|"$/g, ''))
        return {
          user_id: userId,
          name: name ?? '',
          price: parseFloat(price ?? '0') || 0,
          stock: parseInt(stock ?? '0', 10) || 0,
          description: description ?? '',
          category: category ?? '',
        }
      }).filter((r) => r.name)

      if (imports.length === 0) {
        toast({ title: 'CSV kosong atau format salah', variant: 'error' })
        return
      }

      const { error } = await supabase.from('products').insert(imports)
      if (error) throw error

      await loadData(userId)
      toast({
        title: `${imports.length} produk diimport`,
        variant: 'success',
      })
    } catch (error) {
      toast({
        title: 'Import CSV gagal',
        description: error instanceof Error ? error.message : (error as any)?.message,
        variant: 'error',
      })
    } finally {
      if (csvInputRef.current) csvInputRef.current.value = ''
    }
  }

  const saveFaq = async (faq: Faq) => {
    if (!userId) return
    try {
      const { error } = await supabase
        .from('faqs')
        .update({
          question: faq.question,
          answer: faq.answer,
          updated_at: new Date().toISOString(),
        })
        .eq('id', faq.id)
      if (error) throw error
      setEditingFaqId(null)
      await loadData(userId)
      toast({ title: 'FAQ diperbarui', variant: 'success' })
    } catch (error) {
      toast({
        title: 'Gagal menyimpan FAQ',
        description: error instanceof Error ? error.message : (error as any)?.message,
        variant: 'error',
      })
    }
  }

  const addFaq = async () => {
    if (!userId || !newFaq.question.trim() || !newFaq.answer.trim()) return
    try {
      const { error } = await supabase.from('faqs').insert({
        user_id: userId,
        question: newFaq.question.trim(),
        answer: newFaq.answer.trim(),
      })
      if (error) throw error
      setNewFaq({ question: '', answer: '' })
      await loadData(userId)
      toast({ title: 'FAQ ditambahkan', variant: 'success' })
    } catch (error) {
      toast({
        title: 'Gagal menambah FAQ',
        description: error instanceof Error ? error.message : (error as any)?.message,
        variant: 'error',
      })
    }
  }

  const deleteFaq = async (id: string) => {
    if (!userId) return
    try {
      const { error } = await supabase.from('faqs').delete().eq('id', id)
      if (error) throw error
      await loadData(userId)
      toast({ title: 'FAQ dihapus', variant: 'success' })
    } catch (error) {
      toast({
        title: 'Gagal menghapus FAQ',
        description: error instanceof Error ? error.message : (error as any)?.message,
        variant: 'error',
      })
    }
  }

  const testAiReply = async () => {
    if (!testQuestion.trim()) return
    setTestLoading(true)
    setTestResult('')
    try {
      await saveToneSettings()
      const res = await fetch('/api/ai/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: '00000000-0000-0000-0000-000000000001',
          mode: aiMode,
          messages: [{ role: 'user', content: testQuestion.trim() }],
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Request failed')
      setTestResult(
        `${data.reply}\n\n[Confidence: ${data.confidence}% | Action: ${data.suggestedAction} | Lead: ${data.leadScore?.temperature} (${data.leadScore?.score})]`,
      )
    } catch (error) {
      toast({
        title: 'Test AI gagal',
        description: error instanceof Error ? error.message : (error as any)?.message,
        variant: 'error',
      })
    } finally {
      setTestLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length || !userId) return

    setUploadLoading(true)
    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
        if (!['pdf', 'txt', 'docx'].includes(ext)) {
          toast({
            title: `Format tidak didukung: ${file.name}`,
            description: 'Hanya PDF, TXT, DOCX',
            variant: 'error',
          })
          continue
        }

        const path = `${userId}/${Date.now()}-${file.name}`
        const { error: uploadError } = await supabase.storage
          .from('ai_training_documents')
          .upload(path, file)

        let fileUrl: string | null = null
        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('ai_training_documents')
            .getPublicUrl(path)
          fileUrl = urlData.publicUrl
        }

        const { data: doc, error: insertError } = await supabase
          .from('ai_training_documents')
          .insert({
            user_id: userId,
            file_name: file.name,
            file_type: ext,
            file_url: fileUrl,
            file_size: file.size,
            status: 'processing',
          })
          .select()
          .single()

        if (insertError) throw insertError

        setTimeout(async () => {
          await supabase
            .from('ai_training_documents')
            .update({ status: 'completed', updated_at: new Date().toISOString() })
            .eq('id', doc.id)
        }, 2000)
      }

      await loadData(userId)
      toast({ title: 'Dokumen diupload', variant: 'success' })
    } catch (error) {
      toast({
        title: 'Upload gagal',
        description: error instanceof Error ? error.message : (error as any)?.message,
        variant: 'error',
      })
    } finally {
      setUploadLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const scanBrand = async () => {
    if (!brandUrl.trim()) return
    setScanLoading(true)
    try {
      const res = await fetch('/api/ai/scan-brand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: brandUrl.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Scan failed')

      setBusinessName(data.brandName)
      if (userId) await loadData(userId)
      toast({
        title: 'Brand berhasil di-scan',
        description: data.brandName,
        variant: 'success',
      })
    } catch (error) {
      toast({
        title: 'Scan brand gagal',
        description: error instanceof Error ? error.message : (error as any)?.message,
        variant: 'error',
      })
    } finally {
      setScanLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full gap-2 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          Memuat konfigurasi AI...
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="size-7 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">AI Training</h1>
          </div>
          <p className="text-muted-foreground">
            Konfigurasi AI bisnis — produk, FAQ, tone, dan data training
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab: Produk & Harga */}
        {activeTab === 'products' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Produk & Harga</CardTitle>
                <CardDescription>Kelola katalog produk untuk AI</CardDescription>
              </div>
              <div className="flex gap-2">
                <input
                  ref={csvInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleCsvImport}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => csvInputRef.current?.click()}
                >
                  <Upload className="size-4" />
                  Import CSV
                </Button>
                <Button size="sm" onClick={() => openProductModal()}>
                  <Plus className="size-4" />
                  Tambah Produk
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4">
                Format CSV: nama, harga, stok, deskripsi, kategori
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Harga</TableHead>
                    <TableHead>Stok</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="w-24">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        Belum ada produk. Tambah manual atau import CSV.
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell>{formatPrice(p.price)}</TableCell>
                        <TableCell>{p.stock}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{p.description}</TableCell>
                        <TableCell>{p.category}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => openProductModal(p)}
                            >
                              <Edit2 className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => deleteProduct(p.id)}
                            >
                              <Trash2 className="size-3.5 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Tab: FAQ */}
        {activeTab === 'faq' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tambah FAQ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="Pertanyaan"
                  value={newFaq.question}
                  onChange={(e) => setNewFaq((f) => ({ ...f, question: e.target.value }))}
                />
                <Textarea
                  placeholder="Jawaban"
                  value={newFaq.answer}
                  onChange={(e) => setNewFaq((f) => ({ ...f, answer: e.target.value }))}
                />
                <Button onClick={addFaq}>
                  <Plus className="size-4" />
                  Tambah FAQ
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daftar FAQ ({faqs.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {faqs.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Belum ada FAQ.</p>
                ) : (
                  faqs.map((faq) => (
                    <div
                      key={faq.id}
                      className="border border-border rounded-lg p-4 space-y-2"
                    >
                      {editingFaqId === faq.id ? (
                        <>
                          <Input
                            value={faq.question}
                            onChange={(e) =>
                              setFaqs((prev) =>
                                prev.map((f) =>
                                  f.id === faq.id
                                    ? { ...f, question: e.target.value }
                                    : f,
                                ),
                              )
                            }
                          />
                          <Textarea
                            value={faq.answer}
                            onChange={(e) =>
                              setFaqs((prev) =>
                                prev.map((f) =>
                                  f.id === faq.id
                                    ? { ...f, answer: e.target.value }
                                    : f,
                                ),
                              )
                            }
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => saveFaq(faq)}>
                              Simpan
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingFaqId(null)
                                if (userId) void loadData(userId)
                              }}
                            >
                              Batal
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="font-medium">{faq.question}</p>
                          <p className="text-sm text-muted-foreground">{faq.answer}</p>
                          <div className="flex gap-2 pt-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingFaqId(faq.id)}
                            >
                              <Edit2 className="size-3.5" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteFaq(faq.id)}
                            >
                              <Trash2 className="size-3.5 text-destructive" />
                              Hapus
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab: Cara Menjawab */}
        {activeTab === 'tone' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan AI</CardTitle>
                <CardDescription>Tone, instruksi, dan mode otomasi</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Nama Bisnis</Label>
                  <Input
                    id="businessName"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Nama bisnis Anda"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tone">Tone & Gaya Bicara</Label>
                  <Textarea
                    id="tone"
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    placeholder="Contoh: formal, casual, friendly, ramah dan profesional..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instructions">Instruksi Khusus AI</Label>
                  <Textarea
                    id="instructions"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="Instruksi khusus untuk AI saat membalas customer..."
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aiMode">Mode AI</Label>
                  <select
                    id="aiMode"
                    value={aiMode}
                    onChange={(e) => setAiMode(e.target.value as AiMode)}
                    className="flex h-9 w-full rounded-lg border border-border bg-background px-3 text-sm"
                  >
                    <option value="suggestion">Suggestion — AI hanya suggest balasan</option>
                    <option value="semi_auto">Semi Auto — AI suggest, agent approve</option>
                    <option value="full_auto">Full Auto — AI balas otomatis</option>
                  </select>
                </div>
                <Button onClick={saveToneSettings} disabled={saving}>
                  {saving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  Simpan Pengaturan
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Jawaban AI</CardTitle>
                <CardDescription>Preview respons AI dengan pengaturan saat ini</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Ketik pertanyaan customer..."
                  value={testQuestion}
                  onChange={(e) => setTestQuestion(e.target.value)}
                  rows={3}
                />
                <Button onClick={testAiReply} disabled={testLoading || !testQuestion.trim()}>
                  {testLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Sparkles className="size-4" />
                  )}
                  Test Jawaban AI
                </Button>
                {testResult && (
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-sm whitespace-pre-wrap">{testResult}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab: Data Training */}
        {activeTab === 'training' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Dokumen</CardTitle>
                <CardDescription>PDF, TXT, atau DOCX untuk melatih AI</CardDescription>
              </CardHeader>
              <CardContent>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,.docx"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadLoading}
                >
                  {uploadLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Upload className="size-4" />
                  )}
                  Upload Dokumen
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Scan Brand Otomatis</CardTitle>
                <CardDescription>Ekstrak info brand dari website</CardDescription>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Input
                  placeholder="https://website-bisnis-anda.com"
                  value={brandUrl}
                  onChange={(e) => setBrandUrl(e.target.value)}
                />
                <Button onClick={scanBrand} disabled={scanLoading || !brandUrl.trim()}>
                  {scanLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Globe className="size-4" />
                  )}
                  Scan Brand
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dokumen Training ({documents.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Belum ada dokumen.</p>
                ) : (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between border border-border rounded-lg p-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="size-5 text-muted-foreground shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {doc.type?.toUpperCase() ?? "FILE"}
                              {doc.url && ` · ${doc.url}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge
                            variant="outline"
                            className={
                              doc.status === 'completed'
                                ? 'border-emerald-500/50 text-emerald-400'
                                : doc.status === 'processing'
                                  ? 'border-amber-500/50 text-amber-400'
                                  : doc.status === 'failed'
                                    ? 'border-red-500/50 text-red-400'
                                    : ''
                            }
                          >
                            {DOC_STATUS_LABEL[doc.status]}
                          </Badge>
                          {doc.file_url && (
                            <a href={doc.file_url} target="_blank" rel="noreferrer">
                              <Button variant="ghost" size="icon-sm">
                                <Download className="size-3.5" />
                              </Button>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Product Modal */}
      <Dialog open={productModalOpen} onOpenChange={setProductModalOpen}>
        <DialogContent onClose={() => setProductModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Produk' : 'Tambah Produk'}
            </DialogTitle>
            <DialogDescription>
              Isi detail produk untuk AI training
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Nama</Label>
              <Input
                value={productForm.name}
                onChange={(e) =>
                  setProductForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Harga</Label>
                <Input
                  type="number"
                  value={productForm.price}
                  onChange={(e) =>
                    setProductForm((f) => ({ ...f, price: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Stok</Label>
                <Input
                  type="number"
                  value={productForm.stock}
                  onChange={(e) =>
                    setProductForm((f) => ({ ...f, stock: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Kategori</Label>
              <Input
                value={productForm.category}
                onChange={(e) =>
                  setProductForm((f) => ({ ...f, category: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Deskripsi</Label>
              <Textarea
                value={productForm.description}
                onChange={(e) =>
                  setProductForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProductModalOpen(false)}>
              Batal
            </Button>
            <Button onClick={saveProduct} disabled={saving || !productForm.name.trim()}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}

export default function AiTrainingPage() {
  return (
    <ToastProvider>
      <AiTrainingContent />
    </ToastProvider>
  )
}
