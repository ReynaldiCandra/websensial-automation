'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface Webhook {
  id: string
  url: string
  events: string[]
  active: boolean
  createdAt: Date
  lastTriggered?: Date
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([
    {
      id: '1',
      url: 'https://example.com/webhook',
      events: ['lead.created', 'message.sent'],
      active: true,
      createdAt: new Date('2026-08-01'),
      lastTriggered: new Date('2026-08-02')
    }
  ])
  const [showForm, setShowForm] = useState(false)
  const [newUrl, setNewUrl] = useState('')

  const handleAddWebhook = async () => {
    if (!newUrl) return
    
    const webhook: Webhook = {
      id: Date.now().toString(),
      url: newUrl,
      events: ['lead.created'],
      active: true,
      createdAt: new Date()
    }

    try {
      const response = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhook)
      })
      
      if (response.ok) {
        setWebhooks([...webhooks, webhook])
        setNewUrl('')
        setShowForm(false)
      }
    } catch (error) {
      console.error('Failed to add webhook:', error)
    }
  }

  const handleToggle = async (id: string) => {
    const webhook = webhooks.find(w => w.id === id)
    if (!webhook) return

    try {
      await fetch(`/api/webhooks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ active: !webhook.active })
      })

      setWebhooks(webhooks.map(w => w.id === id ? { ...w, active: !w.active } : w))
    } catch (error) {
      console.error('Failed to toggle webhook:', error)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Webhook Management</h1>
          <p className="text-muted-foreground">Manage your integration webhooks</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>Add Webhook</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Webhook</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="https://example.com/webhook"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={handleAddWebhook}>Create</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {webhooks.map(webhook => (
          <Card key={webhook.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{webhook.url}</CardTitle>
                  <CardDescription>
                    Created {webhook.createdAt.toLocaleDateString()}
                  </CardDescription>
                </div>
                <Badge variant={webhook.active ? 'default' : 'secondary'}>
                  {webhook.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Events:</p>
                <div className="flex gap-2">
                  {webhook.events.map(event => (
                    <Badge key={event} variant="outline">{event}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleToggle(webhook.id)}>
                  {webhook.active ? 'Disable' : 'Enable'}
                </Button>
                <Button size="sm" variant="outline">Test</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
