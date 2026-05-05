'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { statusColor } from '@/lib/utils'

interface Property {
  id: string
  name: string
  address: string
  emirate: string
  area: string
  propertyType: string
  status: string
  _count: { units: number; tickets: number }
  units: { id: string; status: string }[]
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/properties').then(r => r.json()).then(setProperties).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <TopBar
        title="Properties"
        subtitle="UAE residential portfolio"
        actions={
          <Link href="/dashboard/properties/new">
            <Button size="sm">+ New Property</Button>
          </Link>
        }
      />
      <div className="p-8">
        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : properties.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 mb-4">No properties yet.</p>
            <Link href="/dashboard/properties/new"><Button>+ Add Property</Button></Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((p) => {
              const occupied = p.units.filter(u => u.status === 'Occupied').length
              const vacant = p.units.filter(u => u.status === 'Vacant').length
              return (
                <Link key={p.id} href={`/dashboard/properties/${p.id}`}>
                  <Card className="hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm">{p.name}</h3>
                          <p className="text-xs text-gray-400 mt-0.5">{p.area}, {p.emirate}</p>
                        </div>
                        <Badge className={statusColor(p.status)}>{p.status}</Badge>
                      </div>
                      <p className="text-xs text-gray-500 mb-3">{p.address}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>🏢 {p.propertyType}</span>
                        <span>🚪 {p._count.units} units</span>
                        <span>🔧 {p._count.tickets} tickets</span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        {occupied > 0 && <Badge className="bg-blue-100 text-blue-700">{occupied} occupied</Badge>}
                        {vacant > 0 && <Badge className="bg-green-100 text-green-700">{vacant} vacant</Badge>}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
