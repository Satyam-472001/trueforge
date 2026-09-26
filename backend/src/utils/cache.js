const cache = new Map()

export const cachePROutput = (prNumber, data) => {
  cache.set(prNumber, data)
}

export const getCachedPROutput = (prNumber) => {
  return cache.get(prNumber)
}

export const clearPRCache = (prNumber) => {
  cache.delete(prNumber)
}

export const cachePRComment = (commentId, data) => {
  cache.set(commentId, data)
}

export const getCachedPRComment = (commentId) => {
  return cache.get(commentId)
}

export const clearPRCommentCache = (commentId) => {
  cache.delete(commentId)
}