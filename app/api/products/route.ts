import { type NextRequest, NextResponse } from "next/server"

// Simulamos una base de datos en memoria (en producción usarías Supabase, Neon, etc.)
const products: any[] = []

export async function GET() {
  return NextResponse.json(products)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const product = {
      id: Date.now().toString(),
      name: body.name,
      category: body.category,
      description: body.description,
      tags: body.tags,
      images: body.images,
      sizes: body.sizes, // Array de { size: "Small", price: 15000, quantity: 10 }
      seller: body.seller,
      createdAt: new Date(),
    }

    products.push(product)
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Error creating product" }, { status: 500 })
  }
}
