'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Rule {
  id: string
  name: string
  trigger: string
  conditions: any[]
  actions: any[]
  enabled: boolean
  priority: number
  createdAt: string
}

export default function RulesPage() {
  const [rules, setRules] = useState<Rule[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRules()
  }, [])

  const fetchRules = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/rules')
      const data = await response.json()
      setRules(data)
    } catch (error) {
      console.error('[Dashboard] Fetch rules error:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleRule = async (ruleId: string, currentState: boolean) => {
    try {
      await fetch(`/api/rules/${ruleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !currentState }),
      })
      fetchRules()
    } catch (error) {
      console.error('[Dashboard] Toggle rule error:', error)
    }
  }

  const deleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure?')) return
    try {
      await fetch(`/api/rules/${ruleId}`, { method: 'DELETE' })
      fetchRules()
    } catch (error) {
      console.error('[Dashboard] Delete rule error:', error)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Automation Rules</h1>
          <p className="text-muted-foreground">Create and manage lead automation rules</p>
        </div>
        <Button>Create Rule</Button>
      </div>

      {/* Rules List */}
      {loading ? (
        <div className="text-center py-8">Loading rules...</div>
      ) : rules.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">No rules yet. Create your first automation rule.</p>
          <Button>Create Rule</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {rules.map((rule) => (
            <Card key={rule.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle>{rule.name}</CardTitle>
                    <CardDescription>
                      Trigger: <span className="font-mono">{rule.trigger}</span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={rule.enabled ? 'default' : 'outline'}>
                      {rule.enabled ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="secondary">Priority: {rule.priority}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">Conditions</p>
                      <p className="text-sm">{rule.conditions.length} condition(s)</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">Actions</p>
                      <p className="text-sm">{rule.actions.length} action(s)</p>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-4 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleRule(rule.id, rule.enabled)}
                    >
                      {rule.enabled ? 'Disable' : 'Enable'}
                    </Button>
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteRule(rule.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
