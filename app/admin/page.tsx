"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2, ShieldAlert } from "lucide-react"

export default function AdminPanel() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<any[]>([])
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    checkAdminAndFetch()
  }, [])

  const checkAdminAndFetch = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    // Verificación de seguridad estricta
    if (!user || !user.email?.toLowerCase().includes("ilyon3d")) {
      setLoading(false)
      return 
    }

    setIsAuthorized(true)

    // Obtener solicitudes pendientes
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('vendor_status', 'pending')

    setRequests(data || [])
    setLoading(false)
  }

  const handleDecision = async (userId: string, approved: boolean) => {
    if(!confirm(`¿Confirmas ${approved ? "APROBAR" : "RECHAZAR"} esta solicitud?`)) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        role: approved ? 'vendor' : 'user',
        vendor_status: approved ? 'approved' : 'rejected'
      })
      .eq('id', userId)

    if (!error) {
      setRequests(requests.filter(r => r.id !== userId))
      alert("Operación exitosa")
    }
  }

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>

  if (!isAuthorized) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-red-600 gap-4">
        <ShieldAlert className="w-16 h-16" />
        <h1 className="text-2xl font-bold">Acceso Restringido</h1>
        <p>Solo el administrador principal puede ver esta página.</p>
        <Button onClick={() => router.push("/")}>Volver</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Administración de Solicitudes</h1>
        
        {requests.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              No hay solicitudes pendientes en este momento.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {requests.map((req) => (
              <Card key={req.id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle>{req.business_info?.businessName || "Sin nombre comercial"}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Usuario: {req.full_name} ({req.email})</p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200">
                    Pendiente
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 mb-6 text-sm bg-muted/30 p-4 rounded-lg">
                    <div>
                      <p className="font-semibold text-muted-foreground">RUT</p>
                      <p>{req.business_info?.rut || "-"}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-muted-foreground">Teléfono</p>
                      <p>{req.business_info?.phone || "-"}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="font-semibold text-muted-foreground">Descripción</p>
                      <p>{req.business_info?.description || "Sin descripción"}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700" 
                      onClick={() => handleDecision(req.id, true)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" /> Aprobar
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="flex-1"
                      onClick={() => handleDecision(req.id, false)}
                    >
                      <XCircle className="w-4 h-4 mr-2" /> Rechazar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
