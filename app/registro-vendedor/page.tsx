"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, CheckCircle, AlertCircle, CreditCard, Building2, User, FileText, Shield } from "lucide-react"

const chileanRegions = [
  "Región de Arica y Parinacota",
  "Región de Tarapacá",
  "Región de Antofagasta",
  "Región de Atacama",
  "Región de Coquimbo",
  "Región de Valparaíso",
  "Región Metropolitana",
  "Región del Libertador General Bernardo O'Higgins",
  "Región del Maule",
  "Región de Ñuble",
  "Región del Biobío",
  "Región de La Araucanía",
  "Región de Los Ríos",
  "Región de Los Lagos",
  "Región Aysén del General Carlos Ibáñez del Campo",
  "Región de Magallanes y de la Antártica Chilena",
]

export default function VendorRegistration() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Personal Info
    fullName: "",
    rut: "",
    email: "",
    phone: "",

    // Business Info
    businessName: "",
    businessDescription: "",
    region: "",
    city: "",
    address: "",

    // Payment Info
    paymentMethod: "",
    mercadopagoEmail: "",
    bankName: "",
    accountType: "",
    accountNumber: "",

    // Documents
    documents: {
      idFront: null as File | null,
      idBack: null as File | null,
      addressProof: null as File | null,
    },

    // Terms
    acceptTerms: false,
    acceptDataProcessing: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Validar RUT chileno
  const validateRUT = (rut: string) => {
    const cleanRUT = rut.replace(/[.-]/g, "")
    if (cleanRUT.length < 8 || cleanRUT.length > 9) return false

    const body = cleanRUT.slice(0, -1)
    const dv = cleanRUT.slice(-1).toLowerCase()

    let sum = 0
    let multiplier = 2

    for (let i = body.length - 1; i >= 0; i--) {
      sum += Number.parseInt(body[i]) * multiplier
      multiplier = multiplier === 7 ? 2 : multiplier + 1
    }

    const remainder = sum % 11
    const calculatedDV = remainder < 2 ? remainder.toString() : remainder === 10 ? "k" : (11 - remainder).toString()

    return dv === calculatedDV
  }

  const formatRUT = (value: string) => {
    const cleaned = value.replace(/[^0-9kK]/g, "")
    if (cleaned.length <= 1) return cleaned

    const body = cleaned.slice(0, -1)
    const dv = cleaned.slice(-1)

    const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    return `${formatted}-${dv}`
  }

  const handleRUTChange = (value: string) => {
    const formatted = formatRUT(value)
    setFormData({ ...formData, rut: formatted })

    if (formatted.length >= 11) {
      if (!validateRUT(formatted)) {
        setErrors({ ...errors, rut: "RUT inválido" })
      } else {
        const newErrors = { ...errors }
        delete newErrors.rut
        setErrors(newErrors)
      }
    }
  }

  const handleFileUpload = (field: keyof typeof formData.documents, file: File) => {
    setFormData({
      ...formData,
      documents: {
        ...formData.documents,
        [field]: file,
      },
    })
  }

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.fullName) newErrors.fullName = "Nombre completo es requerido"
      if (!formData.rut) newErrors.rut = "RUT es requerido"
      else if (!validateRUT(formData.rut)) newErrors.rut = "RUT inválido"
      if (!formData.email) newErrors.email = "Email es requerido"
      if (!formData.phone) newErrors.phone = "Teléfono es requerido"
    }

    if (step === 2) {
      if (!formData.businessName) newErrors.businessName = "Nombre del negocio es requerido"
      if (!formData.businessDescription) newErrors.businessDescription = "Descripción es requerida"
      if (!formData.region) newErrors.region = "Región es requerida"
      if (!formData.city) newErrors.city = "Ciudad es requerida"
    }

    if (step === 3) {
      if (!formData.paymentMethod) newErrors.paymentMethod = "Método de pago es requerido"
      if (formData.paymentMethod === "mercadopago" && !formData.mercadopagoEmail) {
        newErrors.mercadopagoEmail = "Email de MercadoPago es requerido"
      }
      if (formData.paymentMethod === "transferencia") {
        if (!formData.bankName) newErrors.bankName = "Banco es requerido"
        if (!formData.accountType) newErrors.accountType = "Tipo de cuenta es requerido"
        if (!formData.accountNumber) newErrors.accountNumber = "Número de cuenta es requerido"
      }
    }

    if (step === 4) {
      if (!formData.documents.idFront) newErrors.idFront = "Cédula frontal es requerida"
      if (!formData.documents.idBack) newErrors.idBack = "Cédula trasera es requerida"
      if (!formData.documents.addressProof) newErrors.addressProof = "Comprobante de domicilio es requerido"
      if (!formData.acceptTerms) newErrors.acceptTerms = "Debes aceptar los términos y condiciones"
      if (!formData.acceptDataProcessing) newErrors.acceptDataProcessing = "Debes aceptar el procesamiento de datos"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep(4)) return

    setIsSubmitting(true)

    // Simular envío
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Aquí iría la lógica real de envío
    console.log("Formulario enviado:", formData)

    setIsSubmitting(false)
    setCurrentStep(5) // Página de confirmación
  }

  const steps = [
    { number: 1, title: "Información Personal", icon: User },
    { number: 2, title: "Información del Negocio", icon: Building2 },
    { number: 3, title: "Método de Pago", icon: CreditCard },
    { number: 4, title: "Documentos y Términos", icon: FileText },
  ]

  if (currentStep === 5) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">¡Solicitud Enviada!</h2>
            <p className="text-muted-foreground mb-6">
              Tu solicitud para ser vendedor ha sido enviada exitosamente. Revisaremos tu información y te contactaremos
              en las próximas 24-48 horas.
            </p>
            <div className="space-y-2 text-sm text-left bg-muted p-4 rounded-lg">
              <p>
                <strong>Próximos pasos:</strong>
              </p>
              <p>1. Verificaremos tu identidad y documentos</p>
              <p>2. Validaremos tu método de pago</p>
              <p>3. Te enviaremos un email de confirmación</p>
              <p>4. Podrás comenzar a vender una vez aprobado</p>
            </div>
            <Button className="w-full mt-6" asChild>
              <a href="/">Volver al Inicio</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Registro de Vendedor</h1>
          <p className="text-muted-foreground">Únete a nuestra plataforma y comienza a vender tus productos 3D</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.number
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-muted-foreground text-muted-foreground"
                  }`}
                >
                  <step.icon className="w-5 h-5" />
                </div>
                <div className="ml-3 hidden sm:block">
                  <p
                    className={`text-sm font-medium ${
                      currentStep >= step.number ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 ${currentStep > step.number ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {steps[currentStep - 1].icon && <steps[currentStep - 1].icon className="w-5 h-5 mr-2" />}\
              {steps[currentStep - 1].title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Nombre Completo *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Juan Carlos Pérez González"
                    />
                    {errors.fullName && <p className="text-sm text-red-600 mt-1">{errors.fullName}</p>}
                  </div>

                  <div>
                    <Label htmlFor="rut">RUT *</Label>
                    <Input
                      id="rut"
                      value={formData.rut}
                      onChange={(e) => handleRUTChange(e.target.value)}
                      placeholder="12.345.678-9"
                      maxLength={12}
                    />
                    {errors.rut && <p className="text-sm text-red-600 mt-1">{errors.rut}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="juan@ejemplo.com"
                    />
                    {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <Label htmlFor="phone">Teléfono *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+56912345678"
                    />
                    {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
                  </div>
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Tu información personal será verificada y mantenida de forma segura según la Ley de Protección de
                    Datos Personales de Chile.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Step 2: Business Information */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="businessName">Nombre del Negocio *</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder="3D Designs Pro"
                  />
                  {errors.businessName && <p className="text-sm text-red-600 mt-1">{errors.businessName}</p>}
                </div>

                <div>
                  <Label htmlFor="businessDescription">Descripción del Negocio *</Label>
                  <Textarea
                    id="businessDescription"
                    value={formData.businessDescription}
                    onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
                    placeholder="Describe qué tipo de productos 3D vendes, tu experiencia, especialidades, etc."
                    rows={4}
                  />
                  {errors.businessDescription && (
                    <p className="text-sm text-red-600 mt-1">{errors.businessDescription}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="region">Región *</Label>
                    <Select
                      value={formData.region}
                      onValueChange={(value) => setFormData({ ...formData, region: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tu región" />
                      </SelectTrigger>
                      <SelectContent>
                        {chileanRegions.map((region) => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.region && <p className="text-sm text-red-600 mt-1">{errors.region}</p>}
                  </div>

                  <div>
                    <Label htmlFor="city">Ciudad *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Santiago"
                    />
                    {errors.city && <p className="text-sm text-red-600 mt-1">{errors.city}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Dirección (Opcional)</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Calle Ejemplo 123, Comuna"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Payment Method */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <Label>Método de Pago Preferido *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <Card
                      className={`cursor-pointer transition-colors ${
                        formData.paymentMethod === "mercadopago" ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => setFormData({ ...formData, paymentMethod: "mercadopago" })}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="bg-blue-600 text-white px-3 py-2 rounded text-sm font-bold mb-2 inline-block">
                          MercadoPago
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Recibe pagos directamente en tu cuenta MercadoPago
                        </p>
                        <Badge variant="secondary" className="mt-2">
                          Recomendado
                        </Badge>
                      </CardContent>
                    </Card>

                    <Card
                      className={`cursor-pointer transition-colors ${
                        formData.paymentMethod === "transferencia" ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => setFormData({ ...formData, paymentMethod: "transferencia" })}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="bg-gray-800 text-white px-3 py-2 rounded text-sm font-bold mb-2 inline-block">
                          Transferencia
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Los clientes te transferirán directamente a tu cuenta bancaria
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  {errors.paymentMethod && <p className="text-sm text-red-600 mt-1">{errors.paymentMethod}</p>}
                </div>

                {formData.paymentMethod === "mercadopago" && (
                  <div>
                    <Label htmlFor="mercadopagoEmail">Email de MercadoPago *</Label>
                    <Input
                      id="mercadopagoEmail"
                      type="email"
                      value={formData.mercadopagoEmail}
                      onChange={(e) => setFormData({ ...formData, mercadopagoEmail: e.target.value })}
                      placeholder="tu-email@mercadopago.com"
                    />
                    {errors.mercadopagoEmail && <p className="text-sm text-red-600 mt-1">{errors.mercadopagoEmail}</p>}
                    <p className="text-sm text-muted-foreground mt-1">
                      Debe ser el mismo email registrado en tu cuenta MercadoPago
                    </p>
                  </div>
                )}

                {formData.paymentMethod === "transferencia" && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="bankName">Banco *</Label>
                      <Select
                        value={formData.bankName}
                        onValueChange={(value) => setFormData({ ...formData, bankName: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tu banco" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="banco-chile">Banco de Chile</SelectItem>
                          <SelectItem value="banco-estado">BancoEstado</SelectItem>
                          <SelectItem value="santander">Santander</SelectItem>
                          <SelectItem value="bci">BCI</SelectItem>
                          <SelectItem value="scotiabank">Scotiabank</SelectItem>
                          <SelectItem value="itau">Itaú</SelectItem>
                          <SelectItem value="security">Security</SelectItem>
                          <SelectItem value="falabella">Banco Falabella</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.bankName && <p className="text-sm text-red-600 mt-1">{errors.bankName}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="accountType">Tipo de Cuenta *</Label>
                        <Select
                          value={formData.accountType}
                          onValueChange={(value) => setFormData({ ...formData, accountType: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Tipo de cuenta" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="corriente">Cuenta Corriente</SelectItem>
                            <SelectItem value="ahorro">Cuenta de Ahorro</SelectItem>
                            <SelectItem value="vista">Cuenta Vista</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.accountType && <p className="text-sm text-red-600 mt-1">{errors.accountType}</p>}
                      </div>

                      <div>
                        <Label htmlFor="accountNumber">Número de Cuenta *</Label>
                        <Input
                          id="accountNumber"
                          value={formData.accountNumber}
                          onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                          placeholder="123456789"
                        />
                        {errors.accountNumber && <p className="text-sm text-red-600 mt-1">{errors.accountNumber}</p>}
                      </div>
                    </div>
                  </div>
                )}

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {formData.paymentMethod === "mercadopago"
                      ? "Con MercadoPago, los pagos se procesan automáticamente y recibes el dinero en 1-2 días hábiles."
                      : "Con transferencias bancarias, deberás coordinar directamente con el cliente el pago vía WhatsApp."}
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Step 4: Documents and Terms */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Documentos Requeridos</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Cédula de Identidad (Frente) *</Label>
                      <div className="mt-2">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload("idFront", e.target.files[0])}
                          className="hidden"
                          id="idFront"
                        />
                        <label
                          htmlFor="idFront"
                          className="flex items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground rounded-lg cursor-pointer hover:border-primary transition-colors"
                        >
                          {formData.documents.idFront ? (
                            <div className="text-center">
                              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                              <p className="text-sm">{formData.documents.idFront.name}</p>
                            </div>
                          ) : (
                            <div className="text-center">
                              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">Subir cédula (frente)</p>
                            </div>
                          )}
                        </label>
                        {errors.idFront && <p className="text-sm text-red-600 mt-1">{errors.idFront}</p>}
                      </div>
                    </div>

                    <div>
                      <Label>Cédula de Identidad (Reverso) *</Label>
                      <div className="mt-2">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload("idBack", e.target.files[0])}
                          className="hidden"
                          id="idBack"
                        />
                        <label
                          htmlFor="idBack"
                          className="flex items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground rounded-lg cursor-pointer hover:border-primary transition-colors"
                        >
                          {formData.documents.idBack ? (
                            <div className="text-center">
                              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                              <p className="text-sm">{formData.documents.idBack.name}</p>
                            </div>
                          ) : (
                            <div className="text-center">
                              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">Subir cédula (reverso)</p>
                            </div>
                          )}
                        </label>
                        {errors.idBack && <p className="text-sm text-red-600 mt-1">{errors.idBack}</p>}
                      </div>
                    </div>

                    <div>
                      <Label>Comprobante de Domicilio *</Label>
                      <div className="mt-2">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload("addressProof", e.target.files[0])}
                          className="hidden"
                          id="addressProof"
                        />
                        <label
                          htmlFor="addressProof"
                          className="flex items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground rounded-lg cursor-pointer hover:border-primary transition-colors"
                        >
                          {formData.documents.addressProof ? (
                            <div className="text-center">
                              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                              <p className="text-sm">{formData.documents.addressProof.name}</p>
                            </div>
                          ) : (
                            <div className="text-center">
                              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">
                                Subir comprobante (cuenta de luz, agua, etc.)
                              </p>
                            </div>
                          )}
                        </label>
                        {errors.addressProof && <p className="text-sm text-red-600 mt-1">{errors.addressProof}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Términos y Condiciones</h3>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="acceptTerms"
                      checked={formData.acceptTerms}
                      onCheckedChange={(checked) => setFormData({ ...formData, acceptTerms: checked as boolean })}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="acceptTerms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Acepto los términos y condiciones de la plataforma *
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Incluye políticas de venta, comisiones y responsabilidades del vendedor.
                      </p>
                    </div>
                  </div>
                  {errors.acceptTerms && <p className="text-sm text-red-600">{errors.acceptTerms}</p>}

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="acceptDataProcessing"
                      checked={formData.acceptDataProcessing}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, acceptDataProcessing: checked as boolean })
                      }
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="acceptDataProcessing"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Autorizo el procesamiento de mis datos personales *
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Según la Ley 19.628 de Protección de Datos Personales de Chile.
                      </p>
                    </div>
                  </div>
                  {errors.acceptDataProcessing && <p className="text-sm text-red-600">{errors.acceptDataProcessing}</p>}
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Todos los documentos son verificados manualmente por nuestro equipo. El proceso de aprobación toma
                    entre 24-48 horas hábiles.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
                Anterior
              </Button>

              {currentStep < 4 ? (
                <Button onClick={nextStep}>Siguiente</Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
