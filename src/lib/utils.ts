/**
 * Utility functions for the Next Iteration app
 */

/**
 * Extracts a readable name from an email address using common patterns
 * @param email - The email address to extract name from
 * @returns A formatted name string
 */
export function extractNameFromEmail(email: string): string {
  if (!email) return 'User'

  // Get the part before @ symbol
  const localPart = email.split('@')[0]
  
  // Handle different common email patterns
  let nameCandidate = localPart

  // Pattern 1: firstname.lastname or firstname_lastname
  if (nameCandidate.includes('.') || nameCandidate.includes('_')) {
    const separator = nameCandidate.includes('.') ? '.' : '_'
    const parts = nameCandidate.split(separator)
    
    // Capitalize each part and join with space
    nameCandidate = parts
      .map(part => capitalizeFirst(part))
      .join(' ')
  }
  // Pattern 2: firstnameLastname (camelCase detection)
  else if (/^[a-z]+[A-Z][a-z]+/.test(nameCandidate)) {
    // Split on capital letters
    nameCandidate = nameCandidate
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .split(' ')
      .map(part => capitalizeFirst(part))
      .join(' ')
  }
  // Pattern 3: Remove numbers and special characters, capitalize first letter
  else {
    nameCandidate = nameCandidate
      .replace(/[0-9_.-]/g, '')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
    nameCandidate = capitalizeFirst(nameCandidate)
  }

  // Clean up and validate result
  nameCandidate = nameCandidate.trim()
  
  // If result is too short or contains weird patterns, fallback to capitalized original
  if (nameCandidate.length < 2 || /^[^a-zA-Z]/.test(nameCandidate)) {
    nameCandidate = capitalizeFirst(localPart.replace(/[0-9_.-]/g, ''))
  }

  // Final fallback
  return nameCandidate || 'User'
}

/**
 * Capitalizes the first letter of a string and lowercases the rest
 * @param str - String to capitalize
 * @returns Capitalized string
 */
function capitalizeFirst(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Gets a display name for a user, preferring full_name, then extracted email name, then fallback
 * @param user - User object with potential name fields
 * @returns Display name string
 */
export function getUserDisplayName(user: { 
  full_name?: string | null
  email?: string 
  user_metadata?: { full_name?: string | null }
}): string {
  // Priority 1: full_name field
  if (user.full_name?.trim()) {
    return user.full_name.trim()
  }
  
  // Priority 2: user_metadata full_name
  if (user.user_metadata?.full_name?.trim()) {
    return user.user_metadata.full_name.trim()
  }
  
  // Priority 3: Extract from email
  if (user.email) {
    return extractNameFromEmail(user.email)
  }
  
  // Final fallback
  return 'User'
} 