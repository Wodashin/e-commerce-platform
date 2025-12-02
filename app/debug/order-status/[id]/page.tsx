"use client"

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Zap, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function DebugPage({ params }: { params: { id: string } }) {
  const orderId = params.id;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/debug/order/${orderId}`);
        const result = await response.json();
        
        if (response.ok && result.success) {
          setData(result);
        } else {
          setError(result.error || "Error desconocido al obtener datos de debug.");
          console.error("Error de Debug API:", result.details);
        }
      } catch (err: any) {
        setError("Error de red o servidor: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin mr-2" /> Cargando diagnóstico...
    </div>
  );

  if (error) return (
    <div className="min-h-screen p-8">
      <Card className="border-red-500 bg-red-50 text-red-700">
        <CardHeader><CardTitle className="flex items-center gap-2"><XCircle /> Error al Ejecutar Diagnóstico</CardTitle></CardHeader>
        <CardContent><p>{error}</p></CardContent>
      </Card>
      <Link href="/mis-productos" className="mt-4 block"><Button variant="outline">Volver</Button></Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2 text-yellow-600"><Zap /> Diagnóstico de Orden #{orderId.slice(0, 8)}</h1>
        <p className="text-muted-foreground mb-6">Esta página muestra el proceso de descuento de stock de su última compra para identificar el punto exacto de fallo.</p>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Resumen de la Orden</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p><strong>Estado en BD:</strong> <Badge variant={data.orderStatus === 'paid' ? 'default' : 'secondary'}>{data.orderStatus.toUpperCase()}</Badge></p>
                <p><strong>Total pagado:</strong> ${Number(data.orderTotal).toLocaleString("es-CL")}</p>
                <p><strong>Ítems en orden:</strong> {data.orderItemsCount}</p>
              </div>
            </CardContent>
          </Card>

          {data.debug.map((result: any, index: number) => (
            <Card key={index} className={result.status === 'MATCH ENCONTRADO' ? 'border-green-500' : 'border-red-500'}>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2">
                {result.status === 'MATCH ENCONTRADO' ? <CheckCircle className="text-green-500" /> : <AlertTriangle className="text-red-500" />}
                {result.status}
              </CardTitle></CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p><strong>ID Producto:</strong> {result.productId}</p>

                {/* Mostrar comparación detallada solo en fallo */}
                {result.status === 'FALLO DE MATCH' && (
                    <div className="bg-red-50 p-3 rounded border border-red-200">
                        <p className="font-semibold text-red-700">❌ Causa del No-Descuento:</p>
                        <p className="mt-1">El servidor buscó el tamaño <code>"{result.size_ORDEN}"</code> pero no lo encontró en la base de datos de variantes del producto.</p>
                        <p className="mt-2"><strong>Variantes Disponibles en DB:</strong></p>
                        <ul className="list-disc pl-5">
                            {result.variantes_disponibles.map((v: string, i: number) => <li key={i}><code>{v}</code></li>)}
                        </ul>
                        <p className="mt-2 font-bold">SOLUCIÓN: Corregir el formato del tamaño en el formulario original.</p>
                    </div>
                )}

                {result.status === 'MATCH ENCONTRADO' && (
                    <div className="bg-green-50 p-3 rounded border border-green-200">
                        <p><strong>Tamaño DB:</strong> <code>{result.size_DB}</code></p>
                        <p><strong>Stock Antes:</strong> {result.stock_actual}</p>
                        <p><strong>Stock Después:</strong> {result.stock_despues_compra}</p>
                    </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        <Link href="/mis-productos" className="mt-8 block"><Button variant="outline">Volver a Inventario</Button></Link>
      </div>
    </div>
  )
}
