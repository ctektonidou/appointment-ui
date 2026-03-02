export async function getBusinesses(ownerUserId: number) {
  const response = await fetch(
    `http://localhost:8080/api/businesses?ownerUserId=${ownerUserId}`
  )

  if (!response.ok) {
    throw new Error("Failed to fetch businesses")
  }

  return response.json()
}