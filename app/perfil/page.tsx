"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Loader2, Mail, Package, Settings, LogOut, User } from "lucide-react"

export default function ProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/")
        return
      }

      // Intentamos obtener el perfil, si no existe el trigger debería haberlo creado, 
      // pero por seguridad usamos los datos de autenticación si falla la tabla.
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      
      setProfile(data || {
        full_name: user.user_metadata?.full_name,
        email: user.email,
        avatar_url: user.user_metadata?.avatar_url,
        role: 'user'
      })
      setLoading(false)
    }
    getProfile()
  }, [router, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Tarjeta de Usuario */}
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              <Avatar className="w-24 h-24 border-2 border-primary/10">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="text-2xl">{profile?.full_name?.[0] || <User />}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <h1 className="text-3xl font-bold">{profile?.full_name || "Usuario"}</h1>
                <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>{profile?.email}</span>
                </div>
                <Badge variant={profile?.role === 'vendor' ? 'default' : 'secondary'}>
                  {profile?.role === 'vendor' ? 'Vendedor Verificado' : 'Usuario'}
                </Badge>
              </div>
              <Button variant="outline" className="shrink-0" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" /> Cerrar Sesión
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Acciones Principales */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Tarjeta de Gestión de Productos */}
          <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
            <Link href="/mis-productos">
              <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Package className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Mis Publicaciones</h3>
                  <p className="text-muted-foreground">Gestiona tu inventario, edita precios y controla el stock de tus productos.</p>
                </div>
                <Button className="w-full">Gestionar Inventario</Button>
              </CardContent>
            </Link>
          </Card>

          {/* Tarjeta de Configuración (Placeholder) */}
          <Card className="hover:border-primary/50 transition-colors group">
            <CardContent className="p-8 flex flex-col items-center text-center space-y-4 opacity-70">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                <Settings className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Configuración de Cuenta</h3>
                <p className="text-muted-foreground">Datos personales, dirección de envío y métodos de pago.</p>
              </div>
              <Button variant="outline" className="w-full" disabled>Próximamente</Button>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
