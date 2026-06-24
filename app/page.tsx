'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Page() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        router.replace('/dashboard')
      } else {
        router.replace('/landing')
      }
    }

    checkUser()
  }, [])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <img 
          src="/websensial-logo.png" 
          alt="Websensial" 
          className="w-16 h-16 mx-auto"
        />
      </div>
    </div>
  )
}
