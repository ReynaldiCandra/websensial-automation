'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Lead {
  id: string
  name: string
  phone: string
  status: 'new' | 'qualified' | 'converted' | 'lost'
  score: number
  level: 'cold' | 'warm' | 'hot'
  lastMessage: string
  lastMessageAt: string
  messageCount: number
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'hot' | 'warm' | 'cold'>('all')

  useEffect(() => {
    fetchLeads()
  }, [filter])

  const fetchLeads = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/leads?filter=${filter}`)
      const data = await response.json()
      setLeads(data)
    } catch (error) {
      console.error('[Dashboard] Fetch leads error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getScoreBadgeVariant = (level: Lead['level']) => {
    switch (level) {
      case 'hot':
        return 'destructive'
      case 'warm':
        return 'secondary'
      case 'cold':
        return 'outline'
      default:
        return 'default'
    }
  }

  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800'
      case 'qualified':
        return 'bg-yellow-100 text-yellow-800'
      case 'converted':
        return 'bg-green-100 text-green-800'
      case 'lost':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">Manage and track all leads</p>
        </div>
        <Button onClick={() => fetchLeads()}>Refresh</Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'hot', 'warm', 'cold'] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            onClick={() => setFilter(f)}
            className="capitalize"
          >
            {f === 'all' ? 'All Leads' : `${f.charAt(0).toUpperCase() + f.slice(1)} Leads`}
          </Button>
        ))}
      </div>

      {/* Leads Grid */}
      {loading ? (
        <div className="text-center py-8">Loading leads...</div>
      ) : leads.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No leads found</div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {leads.map((lead) => (
            <Card key={lead.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{lead.name}</CardTitle>
                    <CardDescription>{lead.phone}</CardDescription>
                  </div>
                  <Badge variant={getScoreBadgeVariant(lead.level)} className="text-lg">
                    {lead.score}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded capitalize ${getStatusColor(lead.status)}`}>
                    {lead.status}
                  </span>
                </div>

                {/* Score Level */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Level</span>
                  <Badge variant="outline" className="capitalize">
                    {lead.level}
                  </Badge>
                </div>

                {/* Messages */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Messages</span>
                  <span className="font-semibold">{lead.messageCount}</span>
                </div>

                {/* Last Message */}
                <div className="border-t pt-3">
                  <p className="text-xs text-muted-foreground mb-1">Last Message</p>
                  <p className="text-sm line-clamp-2">{lead.lastMessage}</p>
                  <p className="text-xs text-muted-foreground mt-1">{lead.lastMessageAt}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    View
                  </Button>
                  <Button size="sm" className="flex-1">
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
