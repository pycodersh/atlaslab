import type { MoodKey } from './mood-images'

// 스토리 ID(1~100) → Mood 매핑
// magazine-stories.ts 수정 없이 Mood 시스템을 적용하기 위한 별도 파일
export const STORY_MOOD_MAP: Record<number, MoodKey> = {
  1:  'morning',     // A New Start
  2:  'cafe',        // An Old Friend
  3:  'morning',     // An Ordinary Morning
  4:  'study',       // The Night Before
  5:  'rain',        // By the Window
  6:  'reflection',  // Two Roads
  7:  'mountains',   // A Walk Up the Mountain
  8:  'home',        // Dinner Together
  9:  'travel',      // Planning the Trip
  10: 'home',        // The Night Before I Move
  11: 'cafe',        // A Hard Talk
  12: 'cafe',        // A Big Favor
  13: 'work',        // First Day on the Job
  14: 'work',        // Deadlines and Meetings
  15: 'rain',        // When Things Go Wrong
  16: 'work',        // Planning the Project
  17: 'cafe',        // Catching Up
  18: 'weekend',     // A Lazy Sunday
  19: 'cafe',        // How We Met
  20: 'city-walk',   // See You Soon
  21: 'city-walk',   // Finding the Right Fit
  22: 'home',        // The Package
  23: 'cafe',        // A Table for Two
  24: 'reflection',  // At the Clinic
  25: 'city-walk',   // A Stop at the Pharmacy
  26: 'city-walk',   // A Trip to the Bank
  27: 'travel',      // At the Airport
  28: 'travel',      // Checking In
  29: 'city-walk',   // Across Town
  30: 'travel',      // On the Road
  31: 'nature',      // Talking About the Weather
  32: 'nature',      // At the Gym
  33: 'weekend',     // Something New to Love
  34: 'home',        // Around the House
  35: 'home',        // Bedtime
  36: 'study',       // Back to Class
  37: 'home',        // On the Phone
  38: 'work',        // The Team Meeting
  39: 'work',        // Working It Out
  40: 'reflection',  // How I Really Feel
  41: 'city-walk',   // The Return Counter
  42: 'home',        // Food at the Door
  43: 'travel',      // Up in the Air
  44: 'city-walk',   // Finding a Spot
  45: 'study',       // Getting Connected
  46: 'city-walk',   // At the Post Office
  47: 'travel',      // Booking It
  48: 'reflection',  // A Change of Plans
  49: 'home',        // Moving Day
  50: 'home',        // Something Broke
  51: 'work',        // Hit Send
  52: 'home',        // Family Ties
  53: 'cafe',        // Something There
  54: 'cafe',        // Catching Up (friends)
  55: 'cafe',        // Did You Hear?
  56: 'city-walk',   // A Hand from a Stranger
  57: 'home',        // In the Kitchen
  58: 'study',       // Watching the Budget
  59: 'work',        // Tech Troubles
  60: 'cafe',        // Just Say It
  61: 'work',        // A Day at the Desk
  62: 'work',        // A Quick Word
  63: 'work',        // The Interview
  64: 'work',        // Front Line Calls
  65: 'work',        // Happy to Help
  66: 'work',        // Taking the Floor
  67: 'work',        // Making a Deal
  68: 'work',        // Better Together
  69: 'reflection',  // Clearing the Air
  70: 'cafe',        // Let's Make Plans
  71: 'home',        // The Get-Together
  72: 'reflection',  // A Rough Patch
  73: 'cafe',        // Nice One
  74: 'reflection',  // I Owe You One
  75: 'cafe',        // A Little Favor
  76: 'cafe',        // I See What You Mean
  77: 'reflection',  // I Have a Feeling
  78: 'reflection',  // If Only
  79: 'morning',     // My Routine
  80: 'cafe',        // Now You're Talking
  81: 'travel',      // Where To Next
  82: 'city-walk',   // Finding the Way
  83: 'travel',      // Seeing the Sights
  84: 'travel',      // Renting a Car
  85: 'travel',      // Money Abroad
  86: 'city-walk',   // In an Emergency
  87: 'nature',      // Change of Season
  88: 'nature',      // Staying Healthy
  89: 'home',        // Eating Out
  90: 'cafe',        // Coffee Run
  91: 'work',        // On the Call
  92: 'home',        // Online and Texting
  93: 'city-walk',   // What a Deal
  94: 'home',        // Making It Home
  95: 'nature',      // Furry Friends
  96: 'reflection',  // Plan B
  97: 'morning',     // Right on Time
  98: 'study',       // More or Less
  99: 'city-walk',   // Until Next Time
  100: 'cafe',       // One More Thing
}
