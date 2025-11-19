export interface GroupMember {
  id: string
  name: string
  imagePath: string
  accepted: boolean
  checkInCount: number
  createdAt: string
  modifiedAt: string
}

export interface GroupCheckinReaction {
  id: string
  reactionId: string
  emoji: string
  text: string
}

export interface GroupCheckin {
  id: string
  moodId: string
  moodName: string
  moodIds: string[]
  moodNames: string[]
  note: string
  imagePath: string
  createdAt: string
  tags: string[]
  reactions?: { [userId: string]: GroupCheckinReaction }
}

export interface Group {
  name: string
  createdAt: string
  modifiedAt: string
  memberIds: string[]
  membership: {
    [userId: string]: GroupMember
  }
  checkIns: {
    [userId: string]: GroupCheckin
  }
}
