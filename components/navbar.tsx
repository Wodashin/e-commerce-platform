"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AuthModal } from "@/components/auth-modal"
import { ThemeToggle } from "@/components/theme-toggle"
import { CartSheet } from "@/components/cart-sheet"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Menu, X, User as UserIcon, LogOut, ShoppingBag, ShieldCheck } from "lucide-react"

export function Navbar() {
  const supabase = createClient()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  
  // Estados de permisos
  const [isAdmin, setIsAdmin] = useState(false)
  const [isVendor, setIsVendor] = useState(false)

  useEffect(() => {
    const checkUserAndRole = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        // 1. Verificar si es Admin por email
        const adminEmail = "ilyon3d@gmail.com" // Ajusta si es diferente
        const isUserAdmin = user.email?.toLowerCase().includes("ilyon3d")
        setIsAdmin(!!isUserAdmin)

        // 2. Verificar Rol en base de datos
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        // Es vendedor si el rol es 'vendor' O si es el admin supremo
        if (profile?.role === 'vendor' || isUserAdmin) {
          setIsVendor(true)
        } else {
          setIsVendor(false)
        }
      }
    }
    
    checkUserAndRole()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      
      if (session?.user) {
        const isUserAdmin = session.user.email?.toLowerCase().includes("ilyon3d")
        setIsAdmin(!!isUserAdmin)
        
        // Volver a chequear el perfil al cambiar estado
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
          
        if (profile?.role === 'vendor' || isUserAdmin) {
          setIsVendor(true)
        } else {
          setIsVendor(false)
        }
      } else {
        setIsAdmin(false)
        setIsVendor(false)
      }
      
      if (_event === 'SIGNED_OUT') {
        router.refresh()
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">3D</span>
              </div>
              <span className="font-bold text-xl hidden sm:block">Marketplace 3D</span>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="flex-1 max-w-md mx-4 hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input placeholder="Buscar productos 3D..." className="pl-10 pr-4" />
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/productos">Productos</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/categorias">Categorías</Link>
              </Button>

              {/* Botón del Carrito */}
              <CartSheet />

              <ThemeToggle />

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full ml-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name} />
                        <AvatarFallback>{user.email?.[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name || 'Usuario'}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    {/* Solo Admin ve esto */}
                    {isAdmin && (
                      <DropdownMenuItem asChild className="text-orange-600 focus:text-orange-700 bg-orange-50 focus:bg-orange-100">
                        <Link href="/admin">
                          <ShieldCheck className="mr-2 h-4 w-4" />
                          <span>Admin Panel</span>
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem asChild>
                      <Link href="/perfil">
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Mi Perfil</span>
                      </Link>
                    </DropdownMenuItem>

                    {/* Solo Vendedores o Admin ven esto */}
                    {isVendor && (
                      <DropdownMenuItem asChild>
                        <Link href="/subir-producto">
                          <ShoppingBag className="mr-2 h-4 w-4" />
                          <span>Vender Producto</span>
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar Sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="default" onClick={() => setIsAuthModalOpen(true)} className="ml-2">
                  Iniciar Sesión
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <CartSheet />
              <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t py-4">
              <div className="flex flex-col space-y-2">
                <Button variant="ghost" className="justify-start" asChild>
                  <Link href="/productos">Productos</Link>
                </Button>
                
                {user ? (
                  <>
                    {isAdmin && (
                      <Button variant="ghost" className="justify-start text-orange-600" asChild>
                        <Link href="/admin">Panel Admin</Link>
                      </Button>
                    )}
                    <Button variant="ghost" className="justify-start font-bold" asChild>
                      <Link href="/perfil">Mi Perfil</Link>
                    </Button>
                    
                    {isVendor && (
                      <Button variant="ghost" className="justify-start" asChild>
                        <Link href="/subir-producto">Vender Producto</Link>
                      </Button>
                    )}

                    <Button variant="ghost" className="justify-start text-red-500" onClick={handleSignOut}>
                      Cerrar Sesión
                    </Button>
                  </>
                ) : (
                  <Button variant="ghost" className="justify-start" onClick={() => setIsAuthModalOpen(true)}>
                    Iniciar Sesión
                  </Button>
                )}
                
                <div className="pt-2 flex justify-start">
                  <ThemeToggle />
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  )
}
