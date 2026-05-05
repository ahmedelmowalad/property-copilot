import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'AED') {
  return `${currency} ${amount.toLocaleString('en-AE')}`
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-AE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function urgencyColor(urgency: string) {
  switch (urgency) {
    case 'Emergency': return 'bg-red-100 text-red-800 border-red-200'
    case 'High': return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'Low': return 'bg-green-100 text-green-800 border-green-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function statusColor(status: string) {
  switch (status) {
    case 'Active': return 'bg-green-100 text-green-800'
    case 'New': return 'bg-blue-100 text-blue-800'
    case 'InReview': return 'bg-purple-100 text-purple-800'
    case 'Assigned': return 'bg-indigo-100 text-indigo-800'
    case 'WaitingOnTenant': return 'bg-yellow-100 text-yellow-800'
    case 'WaitingOnVendor': return 'bg-orange-100 text-orange-800'
    case 'Completed': return 'bg-green-100 text-green-800'
    case 'Cancelled': return 'bg-gray-100 text-gray-800'
    case 'Occupied': return 'bg-blue-100 text-blue-800'
    case 'Vacant': return 'bg-green-100 text-green-800'
    case 'Maintenance': return 'bg-orange-100 text-orange-800'
    case 'ExpiringSoon': return 'bg-yellow-100 text-yellow-800'
    case 'Expired': return 'bg-red-100 text-red-800'
    case 'Terminated': return 'bg-gray-100 text-gray-800'
    case 'Draft': return 'bg-gray-100 text-gray-600'
    default: return 'bg-gray-100 text-gray-800'
  }
}
