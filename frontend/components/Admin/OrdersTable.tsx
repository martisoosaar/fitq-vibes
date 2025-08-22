'use client'

import React, { useState, useEffect } from 'react'
import { Search, ShoppingCart, Calendar, CreditCard, User, Package, ChevronDown, ChevronUp } from 'lucide-react'

interface Order {
  id: number
  orderNumber: string
  userId: number | null
  trainerId: number | null
  productId: number | null
  customerEmail: string
  customerName: string
  customerPhone: string | null
  shippingAddress: string | null
  billingAddress: string | null
  status: string
  totalAmount: number
  currency: string
  notes: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: number
    email: string
    name: string | null
  } | null
  trainer: {
    id: number
    name: string
  } | null
  product: {
    id: number
    name: string
    trainer: {
      id: number
      name: string
    } | null
  } | null
  orderItems: Array<{
    id: number
    quantity: number
    unitPrice: number
    total: number
    product: {
      id: number
      name: string
    }
  }>
  payments: Array<{
    id: number
    amount: number
    status: string
    paymentMethod: string
    paidAt: string | null
  }>
}

export default function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [statuses, setStatuses] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetchOrders()
  }, [page, search, selectedStatus, dateFrom, dateTo])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(selectedStatus && { status: selectedStatus }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo })
      })

      const response = await fetch(`/api/admin/orders?${params}`)
      const data = await response.json()

      if (response.ok) {
        setOrders(data.orders)
        setTotalPages(data.totalPages)
        setTotal(data.total)
        setStatuses(data.statuses || [])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('et-EE', {
      style: 'currency',
      currency
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('et-EE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'paid':
        return 'bg-green-500/20 text-green-400'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'processing':
        return 'bg-blue-500/20 text-blue-400'
      case 'cancelled':
      case 'failed':
        return 'bg-red-500/20 text-red-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const toggleOrderExpanded = (orderId: number) => {
    const newExpanded = new Set(expandedOrders)
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId)
    } else {
      newExpanded.add(orderId)
    }
    setExpandedOrders(newExpanded)
  }

  return (
    <div className="bg-[#3e4551] rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-[#40b236]" />
          Tellimused ({total})
        </h2>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Otsi tellimusi..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full pl-10 pr-4 py-2 bg-[#2c313a] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#40b236]"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value)
            setPage(1)
          }}
          className="px-4 py-2 bg-[#2c313a] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#40b236]"
        >
          <option value="">Kõik staatused</option>
          {statuses.map(status => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={dateFrom}
          onChange={(e) => {
            setDateFrom(e.target.value)
            setPage(1)
          }}
          className="px-4 py-2 bg-[#2c313a] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#40b236]"
          placeholder="Alates"
        />

        <input
          type="date"
          value={dateTo}
          onChange={(e) => {
            setDateTo(e.target.value)
            setPage(1)
          }}
          className="px-4 py-2 bg-[#2c313a] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#40b236]"
          placeholder="Kuni"
        />

        {(dateFrom || dateTo) && (
          <button
            onClick={() => {
              setDateFrom('')
              setDateTo('')
              setPage(1)
            }}
            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            Tühjenda kuupäevad
          </button>
        )}
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
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Tellimus</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Toode / Treener</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Klient</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Kuupäev</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Summa</th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium">Makse</th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium">Staatus</th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <React.Fragment key={order.id}>
                  <tr 
                    className="border-b border-gray-700 hover:bg-[#4d5665] transition-colors cursor-pointer"
                    onClick={() => toggleOrderExpanded(order.id)}
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium">{order.orderNumber}</div>
                    </td>
                    <td className="py-3 px-4">
                      {order.product ? (
                        <div>
                          <div className="font-medium">{order.product.name}</div>
                          <div className="text-sm text-[#40b236]">
                            {order.trainer?.name || order.product.trainer?.name || '-'}
                          </div>
                        </div>
                      ) : order.customerName ? (
                        <div>
                          <div className="text-gray-400">{order.customerName}</div>
                          {order.trainer && (
                            <div className="text-sm text-[#40b236]">{order.trainer.name}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="font-medium">{order.customerName}</div>
                          <div className="text-sm text-gray-400">{order.customerEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-300">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{formatDate(order.createdAt)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      {formatPrice(order.totalAmount, order.currency)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {order.payments.length > 0 ? (
                        <div className="flex items-center justify-center gap-1">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          <span className={`px-2 py-1 rounded text-xs ${
                            order.payments.some(p => p.status === 'completed' || p.status === 'PAID') 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {order.payments[0].paymentMethod}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded text-sm ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {expandedOrders.has(order.id) ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </td>
                  </tr>
                  
                  {/* Expanded details */}
                  {expandedOrders.has(order.id) && (
                    <tr className="bg-[#2c313a]">
                      <td colSpan={7} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Order items */}
                          {order.orderItems.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2 flex items-center gap-2">
                                <Package className="w-4 h-4 text-[#40b236]" />
                                Tooted
                              </h4>
                              <div className="space-y-1">
                                {order.orderItems.map(item => (
                                  <div key={item.id} className="text-sm text-gray-300">
                                    {item.quantity}x {item.product.name} - {formatPrice(item.total)}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Payment details */}
                          {order.payments.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2 flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-[#40b236]" />
                                Maksed
                              </h4>
                              <div className="space-y-1">
                                {order.payments.map(payment => (
                                  <div key={payment.id} className="text-sm text-gray-300">
                                    {formatPrice(payment.amount)} - {payment.paymentMethod} 
                                    <span className={`ml-2 px-1 py-0.5 rounded text-xs ${getStatusColor(payment.status)}`}>
                                      {payment.status}
                                    </span>
                                    {payment.paidAt && (
                                      <span className="ml-2 text-gray-400">
                                        ({formatDate(payment.paidAt)})
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Notes */}
                          {order.notes && (
                            <div className="md:col-span-2">
                              <h4 className="font-medium mb-2">Märkused</h4>
                              <p className="text-sm text-gray-300">{order.notes}</p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          {orders.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              Tellimusi ei leitud
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