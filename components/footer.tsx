import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">3D</span>
              </div>
              <span className="font-bold text-lg">Marketplace 3D</span>
            </div>
            <p className="text-sm text-muted-foreground">
              La plataforma líder en Chile para productos impresos en 3D. Conectamos diseñadores con clientes que buscan
              productos únicos y personalizados.
            </p>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon">
                <Facebook className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Instagram className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Youtube className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Enlaces Rápidos</h3>
            <div className="space-y-2 text-sm">
              <Link href="/productos" className="block text-muted-foreground hover:text-foreground transition-colors">
                Todos los Productos
              </Link>
              <Link href="/categorias" className="block text-muted-foreground hover:text-foreground transition-colors">
                Categorías
              </Link>
              <Link href="/vendedores" className="block text-muted-foreground hover:text-foreground transition-colors">
                Vendedores Destacados
              </Link>
              <Link
                href="/como-funciona"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Cómo Funciona
              </Link>
              <Link href="/blog" className="block text-muted-foreground hover:text-foreground transition-colors">
                Blog
              </Link>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold">Soporte</h3>
            <div className="space-y-2 text-sm">
              <Link href="/ayuda" className="block text-muted-foreground hover:text-foreground transition-colors">
                Centro de Ayuda
              </Link>
              <Link href="/contacto" className="block text-muted-foreground hover:text-foreground transition-colors">
                Contacto
              </Link>
              <Link href="/terminos" className="block text-muted-foreground hover:text-foreground transition-colors">
                Términos y Condiciones
              </Link>
              <Link href="/privacidad" className="block text-muted-foreground hover:text-foreground transition-colors">
                Política de Privacidad
              </Link>
              <Link
                href="/devoluciones"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Devoluciones
              </Link>
            </div>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-4">
            <h3 className="font-semibold">Contacto</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <a href="mailto:ILyon3d@gmail.com" className="hover:text-foreground transition-colors">
                  ILyon3d@gmail.com
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <a
                  href="https://wa.me/56948842564"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  +56 9 4884 2564
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Santiago, Chile</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Newsletter</h4>
              <p className="text-xs text-muted-foreground">Recibe las últimas novedades y ofertas especiales</p>
              <div className="flex space-x-2">
                <Input placeholder="Tu email" className="text-sm" />
                <Button size="sm">Suscribirse</Button>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-muted-foreground">
            © 2024 Marketplace 3D Chile. Todos los derechos reservados.
          </div>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>Pagos seguros con</span>
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">MercadoPago</div>
              <div className="bg-gray-800 text-white px-2 py-1 rounded text-xs">Webpay</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
