'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Edit, Trash, Package } from 'lucide-react'

interface Product {
  id: number
  name: string
  description: string | null
  price: number
  sku: string | null
  stockQuantity: number | null
  category: string | null
  imageUrl: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  trainer: {
    id: number
    name: string
  } | null
  _count: {
    orderItems: number
  }
}

export default function ProductsTable() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchProducts()
  }, [page, search, selectedCategory, selectedStatus])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedStatus && { isActive: selectedStatus })
      })

      const response = await fetch(`/api/admin/products?${params}`)
      const data = await response.json()

      if (response.ok) {
        setProducts(data.products)
        setTotalPages(data.totalPages)
        setTotal(data.total)
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('et-EE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('et-EE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className="bg-[#3e4551] rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Package className="w-6 h-6 text-[#40b236]" />
          Tooted ({total})
        </h2>
        <button className="bg-[#40b236] text-white px-4 py-2 rounded-lg hover:bg-[#359429] transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Lisa toode
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Otsi tooteid..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full pl-10 pr-4 py-2 bg-[#2c313a] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#40b236]"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value)
            setPage(1)
          }}
          className="px-4 py-2 bg-[#2c313a] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#40b236]"
        >
          <option value="">Kõik kategooriad</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value)
            setPage(1)
          }}
          className="px-4 py-2 bg-[#2c313a] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#40b236]"
        >
          <option value="">Kõik staatused</option>
          <option value="true">Aktiivne</option>
          <option value="false">Mitteaktiivne</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#40b236]"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Pilt</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Nimi</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Treener</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Kategooria</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Hind</th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium">Tellimusi</th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium">Staatus</th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium">Tegevused</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-gray-700 hover:bg-[#4d5665] transition-colors">
                  <td className="py-3 px-4">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/images/placeholder.png'
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium">{product.name}</div>
                      {product.description && (
                        <div className="text-sm text-gray-400 truncate max-w-xs">
                          {product.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {product.trainer ? (
                      <span className="text-[#40b236]">{product.trainer.name}</span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {product.category ? (
                      <span className="px-2 py-1 bg-[#2c313a] rounded text-sm">
                        {product.category}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    {formatPrice(product.price)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {product._count.orderItems > 0 ? (
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-sm">
                        {product._count.orderItems}
                      </span>
                    ) : (
                      <span className="text-gray-500">0</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {product.isActive ? (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-sm">
                        Aktiivne
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-sm">
                        Mitteaktiivne
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        className="p-1 hover:bg-[#2c313a] rounded transition-colors"
                        title="Muuda"
                      >
                        <Edit className="w-4 h-4 text-blue-400" />
                      </button>
                      <button
                        className="p-1 hover:bg-[#2c313a] rounded transition-colors"
                        title="Kustuta"
                      >
                        <Trash className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {products.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              Tooteid ei leitud
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-400">
                Näitan {((page - 1) * 20) + 1} - {Math.min(page * 20, total)} / {total}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 bg-[#2c313a] rounded hover:bg-[#4d5665] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Eelmine
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = page - 2 + i
                  if (pageNum < 1 || pageNum > totalPages) return null
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-1 rounded transition-colors ${
                        pageNum === page 
                          ? 'bg-[#40b236] text-white' 
                          : 'bg-[#2c313a] hover:bg-[#4d5665]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                }).filter(Boolean)}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 bg-[#2c313a] rounded hover:bg-[#4d5665] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Järgmine
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}