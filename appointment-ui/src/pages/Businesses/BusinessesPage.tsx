import { useEffect, useState } from "react"
import { getBusinesses } from "../../api/businessApi"

function BusinessesPage() {
  const [businesses, setBusinesses] = useState<any[]>([])

  useEffect(() => {
    getBusinesses(1)
      .then(setBusinesses)
      .catch(console.error)
  }, [])

  return (
    <div>
      <h2>My Businesses</h2>

      {businesses.map((b) => (
        <div key={b.id}>
          {b.name}
        </div>
      ))}
    </div>
  )
}

export default BusinessesPage