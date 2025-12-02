"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Building2, CheckCircle, Loader2 } from "lucide-react"

export default function VendorRegistration() {
  const [formData, setFormData] = useState({
    businessName: "",
    description: "",
    phone: "",
    rut: "",
    address: "",
    acceptTerms: false
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleSubmit = async () => {
    if (!formData.businessName || !formData.rut || !formData.acceptTerms) {
      alert("Por favor completa los campos obligatorios")
      return
    }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert("Debes iniciar sesión primero")
        return
      }

      // Guardar solicitud en la tabla profiles
      const { error } = await supabase
        .from('profiles')
        .update({
          vendor_status: 'pending',
          business_info: {
            businessName: formData.businessName,
            description: formData.description,
            rut: formData.rut,
            phone: formData.phone,
            address: formData.address
          }
        })
        .eq('id', user.id)

      if (error) throw error
      setSuccess(true)

    } catch (error: any) {
      console.error(error)
      alert("Error al enviar solicitud: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center p-6">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">¡Solicitud Enviada!</h2>
          <p className="text-muted-foreground mb-6">
            Hemos recibido tu solicitud para ser vendedor. El administrador la revisará pronto.
          </p>
          <Button asChild className="w-full">
            <a href="/">Volver al Inicio</a>
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-center">Registro de Vendedor</h1>
        <p className="text-muted-foreground text-center mb-8">Únete a nuestra comunidad de creadores 3D</p>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" /> Datos del Negocio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nombre del Negocio / Marca *</Label>
              <Input 
                value={formData.businessName} 
                onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                placeholder="Ej: Impresiones 3D Chile"
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>RUT *</Label>
                <Input 
                  value={formData.rut} 
                  onChange={(e) => setFormData({...formData, rut: e.target.value})}
                  placeholder="12.345.678-9"
                />
              </div>
              <div>
                <Label>Teléfono</Label>
                <Input 
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+56 9..."
                />
              </div>
            </div>

            <div>
              <Label>Descripción del Negocio</Label>
              <Textarea 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="¿Qué tipo de productos vendes?"
              />
            </div>

            <div className="flex items-center space-x-2 pt-4">
              <Checkbox 
                id="terms" 
                checked={formData.acceptTerms}
                onCheckedChange={(c) => setFormData({...formData, acceptTerms: c as boolean})}
              />
              <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Acepto los términos y condiciones de venta
              </label>
            </div>

            <Button onClick={handleSubmit} className="w-full mt-6" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Enviar Solicitud
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
