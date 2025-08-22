'use client'

import { useState, useEffect } from 'react'
import { Search, CreditCard, Calendar, CheckCircle, XCircle, Clock, User, ShoppingCart } from 'lucide-react'

interface Payment {
  id: number
  orderId: number | null
  userId: number | null
  paymentMethod: string
  transactionId: string | null
  amount: number
  currency: string
  status: string
  gatewayResponse: string | null
  paidAt: string | null
  createdAt: string
  updatedAt: string
  order: {
    id: number
    orderNumber: string
    customerName: string
    customerEmail: string
  } | null
  user: {
    id: number
    email: string
    name: string | null
  } | null
}

export default function PaymentsTable() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedMethod, setSelectedMethod] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [statuses, setStatuses] = useState<string[]>([])
  const [methods, setMethods] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchPayments()
  }, [page, search, selectedStatus, selectedMethod, dateFrom, dateTo])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(selectedStatus && { status: selectedStatus }),
        ...(selectedMethod && { method: selectedMethod }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo })
      })

      const response = await fetch(`/api/admin/payments?${params}`)
      const data = await response.json()

      if (response.ok) {
        setPayments(data.payments)
        setTotalPages(data.totalPages)
        setTotal(data.total)
        setStatuses(data.statuses || [])
        setMethods(data.methods || [])
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('et-EE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />
      case 'failed':
      case 'cancelled':
      case 'refunded':
        return <XCircle className="w-4 h-4 text-red-400" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'paid':
        return 'bg-green-500/20 text-green-400'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'failed':
      case 'cancelled':
        return 'bg-red-500/20 text-red-400'
      case 'refunded':
        return 'bg-purple-500/20 text-purple-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'card':
      case 'stripe':
        return '💳'
      case 'bank_transfer':
      case 'swedbank':
      case 'montonio':
        return '🏦'
      case 'paypal':
        return '🅿️'
      default:
        return '💰'
    }
  }

  return (
    <div className="bg-[#3e4551] rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-[#40b236]" />
          Maksed ({total})
        </h2>
        <div className="text-lg font-medium text-[#40b236]">
          Kokku: {formatPrice(payments.reduce((sum, p) => sum + p.amount, 0))}
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Otsi makseid..."
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

        <select
          value={selectedMethod}
          onChange={(e) => {
            setSelectedMethod(e.target.value)
            setPage(1)
          }}
          className="px-4 py-2 bg-[#2c313a] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#40b236]"
        >
          <option value="">Kõik meetodid</option>
          {methods.map(method => (
            <option key={method} value={method}>
              {method}
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
            Tühjenda
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
                <th className="text-left py-3 px-4 text-gray-400 font-medium">ID / Viide</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Tellimus</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Klient</th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium">Meetod</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Summa</th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium">Staatus</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Makstud</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Loodud</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b border-gray-700 hover:bg-[#4d5665] transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-mono text-sm">
                      {payment.transactionId || `PAY-${payment.id}`}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {payment.order ? (
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="font-medium">{payment.order.orderNumber}</div>
                          <div className="text-sm text-gray-400">{payment.order.customerName}</div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {payment.user ? (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm">{payment.user.name || payment.user.email}</div>
                          {payment.user.name && (
                            <div className="text-xs text-gray-400">{payment.user.email}</div>
                          )}
                        </div>
                      </div>
                    ) : payment.order ? (
                      <div className="text-sm text-gray-400">
                        {payment.order.customerEmail}
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-xl" title={payment.paymentMethod}>
                      {getMethodIcon(payment.paymentMethod)}
                    </span>
                    <div className="text-xs text-gray-400 mt-1">
                      {payment.paymentMethod}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-lg">
                    {formatPrice(payment.amount, payment.currency)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {getStatusIcon(payment.status)}
                      <span className={`px-2 py-1 rounded text-sm ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-300">
                        {formatDate(payment.paidAt)}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-400">
                      {formatDate(payment.createdAt)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {payments.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              Makseid ei leitud
            </div>
          )}

          {/* Summary */}
          {payments.length > 0 && (
            <div className="mt-4 p-4 bg-[#2c313a] rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Kokku makseid</div>
                  <div className="text-xl font-bold">{total}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Summa lehel</div>
                  <div className="text-xl font-bold text-[#40b236]">
                    {formatPrice(payments.reduce((sum, p) => sum + p.amount, 0))}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Õnnestunud</div>
                  <div className="text-xl font-bold text-green-400">
                    {payments.filter(p => 
                      p.status?.toLowerCase() === 'completed' || 
                      p.status?.toLowerCase() === 'paid'
                    ).length}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Ebaõnnestunud</div>
                  <div className="text-xl font-bold text-red-400">
                    {payments.filter(p => 
                      p.status?.toLowerCase() === 'failed' || 
                      p.status?.toLowerCase() === 'cancelled'
                    ).length}
                  </div>
                </div>
              </div>
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