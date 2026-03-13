// Neetcode 150 structured as Milestones (topics) > Units (problems)
// Arrays & Hashing is fully fleshed out. Other milestones are stubs to unlock later.

export const milestones = [
  {
    id: 'arrays-hashing',
    name: 'Arrays & Hashing',
    emoji: '🗂️',
    unlocked: true,
    units: [
      {
        id: 'contains-duplicate',
        name: 'Contains Duplicate',
        difficulty: 'Easy',
        summary: "You're given a list of numbers. Your only job: figure out if any number appears more than once. If yes, return true. If every number is unique, return false. Simple idea, but the trick is doing it fast — without checking every pair.",
        description:
          'Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.',
        starterCode: {
          java: `class Solution {
    public boolean containsDuplicate(int[] nums) {
        // your code here
    }
}`,
          python: `class Solution:
    def containsDuplicate(self, nums: List[int]) -> bool:
        # your code here`,
          cpp: `class Solution {
public:
    bool containsDuplicate(vector<int>& nums) {
        // your code here
    }
};`,
          c: `bool containsDuplicate(int* nums, int numsSize) {
    // your code here
}`,
          javascript: `var containsDuplicate = function(nums) {
    // your code here
};`,
        },
        testCases: [
          { input: '[1,2,3,1]', expected: 'true' },
          { input: '[1,2,3,4]', expected: 'false' },
          { input: '[1,1,1,3,3,4,3,2,4,2]', expected: 'true' },
        ],
      },
      {
        id: 'valid-anagram',
        name: 'Valid Anagram',
        difficulty: 'Easy',
        summary: "You're given two words. An anagram means they use the exact same letters, just rearranged — like \"listen\" and \"silent\". Your job: check whether word t is a rearrangement of word s. Same letters, same counts — just in a different order.",
        description:
          'Given two strings s and t, return true if t is an anagram of s, and false otherwise. An anagram uses the same characters in any order.',
        starterCode: {
          java: `class Solution {
    public boolean isAnagram(String s, String t) {
        // your code here
    }
}`,
          python: `class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        # your code here`,
          cpp: `class Solution {
public:
    bool isAnagram(string s, string t) {
        // your code here
    }
};`,
          c: `bool isAnagram(char* s, char* t) {
    // your code here
}`,
          javascript: `var isAnagram = function(s, t) {
    // your code here
};`,
        },
        testCases: [
          { input: 's="anagram", t="nagaram"', expected: 'true' },
          { input: 's="rat", t="car"', expected: 'false' },
        ],
      },
      {
        id: 'two-sum',
        name: 'Two Sum',
        difficulty: 'Easy',
        summary: "You have a list of numbers and a target sum. Find the two numbers that add up to the target and return their positions (indices) in the list. There's always exactly one answer, and you can't use the same number twice.",
        description:
          'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input has exactly one solution.',
        starterCode: {
          java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // your code here
    }
}`,
          python: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # your code here`,
          cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // your code here
    }
};`,
          c: `int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    // your code here
}`,
          javascript: `var twoSum = function(nums, target) {
    // your code here
};`,
        },
        testCases: [
          { input: 'nums=[2,7,11,15], target=9', expected: '[0,1]' },
          { input: 'nums=[3,2,4], target=6', expected: '[1,2]' },
          { input: 'nums=[3,3], target=6', expected: '[0,1]' },
        ],
      },
      {
        id: 'group-anagrams',
        name: 'Group Anagrams',
        difficulty: 'Medium',
        summary: "You're given a bunch of words. Words that are anagrams of each other (same letters, different order) belong in the same group. Your job: sort them into those groups and return the result. For example, \"eat\", \"tea\", and \"ate\" all go together.",
        description:
          'Given an array of strings strs, group the anagrams together. You can return the answer in any order.',
        starterCode: {
          java: `class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        // your code here
    }
}`,
          python: `class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
        # your code here`,
          cpp: `class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        // your code here
    }
};`,
          c: `char*** groupAnagrams(char** strs, int strsSize, int* returnSize, int** returnColumnSizes) {
    // your code here
}`,
          javascript: `var groupAnagrams = function(strs) {
    // your code here
};`,
        },
        testCases: [
          {
            input: 'strs=["eat","tea","tan","ate","nat","bat"]',
            expected: '[["bat"],["nat","tan"],["ate","eat","tea"]]',
          },
          { input: 'strs=[""]', expected: '[[""]]' },
          { input: 'strs=["a"]', expected: '[["a"]]' },
        ],
      },
      {
        id: 'top-k-frequent',
        name: 'Top K Frequent Elements',
        difficulty: 'Medium',
        summary: "You have a list of numbers, and you need to find the k numbers that appear the most often. If k=2, find the two most frequent numbers. The order of your answer doesn't matter — just get the right ones.",
        description:
          'Given an integer array nums and an integer k, return the k most frequent elements. You may return the answer in any order.',
        starterCode: {
          java: `class Solution {
    public int[] topKFrequent(int[] nums, int k) {
        // your code here
    }
}`,
          python: `class Solution:
    def topKFrequent(self, nums: List[int], k: int) -> List[int]:
        # your code here`,
          cpp: `class Solution {
public:
    vector<int> topKFrequent(vector<int>& nums, int k) {
        // your code here
    }
};`,
          c: `int* topKFrequent(int* nums, int numsSize, int k, int* returnSize) {
    // your code here
}`,
          javascript: `var topKFrequent = function(nums, k) {
    // your code here
};`,
        },
        testCases: [
          { input: 'nums=[1,1,1,2,2,3], k=2', expected: '[1,2]' },
          { input: 'nums=[1], k=1', expected: '[1]' },
        ],
      },
      {
        id: 'product-except-self',
        name: 'Product of Array Except Self',
        difficulty: 'Medium',
        summary: "For each position in the array, calculate the product of every other number — every number except the one at that position. The catch: you can't use division, and it needs to run in a single pass. You'll build the answer using prefix and suffix products.",
        description:
          'Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i]. You must solve it in O(n) time without using the division operation.',
        starterCode: {
          java: `class Solution {
    public int[] productExceptSelf(int[] nums) {
        // your code here
    }
}`,
          python: `class Solution:
    def productExceptSelf(self, nums: List[int]) -> List[int]:
        # your code here`,
          cpp: `class Solution {
public:
    vector<int> productExceptSelf(vector<int>& nums) {
        // your code here
    }
};`,
          c: `int* productExceptSelf(int* nums, int numsSize, int* returnSize) {
    // your code here
}`,
          javascript: `var productExceptSelf = function(nums) {
    // your code here
};`,
        },
        testCases: [
          { input: '[1,2,3,4]', expected: '[24,12,8,6]' },
          { input: '[-1,1,0,-3,3]', expected: '[0,0,9,0,0]' },
        ],
      },
      {
        id: 'longest-consecutive',
        name: 'Longest Consecutive Sequence',
        difficulty: 'Medium',
        summary: "Given a jumbled list of numbers, find the longest run of consecutive integers — numbers that follow each other like 1, 2, 3, 4. The array isn't sorted, and you can't sort it (that would be too slow). You need to find the longest streak in O(n) time using a HashSet.",
        description:
          'Given an unsorted array of integers nums, return the length of the longest consecutive elements sequence. You must write an algorithm that runs in O(n) time.',
        starterCode: {
          java: `class Solution {
    public int longestConsecutive(int[] nums) {
        // your code here
    }
}`,
          python: `class Solution:
    def longestConsecutive(self, nums: List[int]) -> int:
        # your code here`,
          cpp: `class Solution {
public:
    int longestConsecutive(vector<int>& nums) {
        // your code here
    }
};`,
          c: `int longestConsecutive(int* nums, int numsSize) {
    // your code here
}`,
          javascript: `var longestConsecutive = function(nums) {
    // your code here
};`,
        },
        testCases: [
          { input: '[100,4,200,1,3,2]', expected: '4' },
          { input: '[0,3,7,2,5,8,4,6,0,1]', expected: '9' },
        ],
      },
    ],
  },
  {
    id: 'two-pointers',
    name: 'Two Pointers',
    emoji: '👆',
    unlocked: false,
    units: [
      { id: 'valid-palindrome', name: 'Valid Palindrome', difficulty: 'Easy' },
      { id: 'two-sum-ii', name: 'Two Sum II', difficulty: 'Medium' },
      { id: 'three-sum', name: '3Sum', difficulty: 'Medium' },
      { id: 'container-water', name: 'Container With Most Water', difficulty: 'Medium' },
      { id: 'trapping-rain', name: 'Trapping Rain Water', difficulty: 'Hard' },
    ],
  },
  {
    id: 'sliding-window',
    name: 'Sliding Window',
    emoji: '🪟',
    unlocked: false,
    units: [
      { id: 'best-time-stock', name: 'Best Time to Buy and Sell Stock', difficulty: 'Easy' },
      { id: 'longest-substring', name: 'Longest Substring Without Repeating Characters', difficulty: 'Medium' },
      { id: 'longest-repeating-char', name: 'Longest Repeating Character Replacement', difficulty: 'Medium' },
      { id: 'minimum-window', name: 'Minimum Window Substring', difficulty: 'Hard' },
    ],
  },
  {
    id: 'stack',
    name: 'Stack',
    emoji: '📚',
    unlocked: false,
    units: [
      { id: 'valid-parentheses', name: 'Valid Parentheses', difficulty: 'Easy' },
      { id: 'min-stack', name: 'Min Stack', difficulty: 'Medium' },
      { id: 'daily-temperatures', name: 'Daily Temperatures', difficulty: 'Medium' },
      { id: 'largest-rectangle-histogram', name: 'Largest Rectangle in Histogram', difficulty: 'Hard' },
    ],
  },
  {
    id: 'binary-search',
    name: 'Binary Search',
    emoji: '🔍',
    unlocked: false,
    units: [
      { id: 'binary-search', name: 'Binary Search', difficulty: 'Easy' },
      { id: 'search-2d-matrix', name: 'Search a 2D Matrix', difficulty: 'Medium' },
      { id: 'find-min-rotated', name: 'Find Minimum in Rotated Sorted Array', difficulty: 'Medium' },
    ],
  },
  {
    id: 'linked-list',
    name: 'Linked List',
    emoji: '🔗',
    unlocked: false,
    units: [
      { id: 'reverse-linked-list', name: 'Reverse Linked List', difficulty: 'Easy' },
      { id: 'merge-two-lists', name: 'Merge Two Sorted Lists', difficulty: 'Easy' },
      { id: 'linked-list-cycle', name: 'Linked List Cycle', difficulty: 'Easy' },
      { id: 'reorder-list', name: 'Reorder List', difficulty: 'Medium' },
    ],
  },
  {
    id: 'trees',
    name: 'Trees',
    emoji: '🌳',
    unlocked: false,
    units: [
      { id: 'invert-binary-tree', name: 'Invert Binary Tree', difficulty: 'Easy' },
      { id: 'max-depth-tree', name: 'Maximum Depth of Binary Tree', difficulty: 'Easy' },
      { id: 'same-tree', name: 'Same Tree', difficulty: 'Easy' },
      { id: 'level-order-traversal', name: 'Binary Tree Level Order Traversal', difficulty: 'Medium' },
    ],
  },
  {
    id: 'graphs',
    name: 'Graphs',
    emoji: '📊',
    unlocked: false,
    units: [
      { id: 'number-of-islands', name: 'Number of Islands', difficulty: 'Medium' },
      { id: 'clone-graph', name: 'Clone Graph', difficulty: 'Medium' },
      { id: 'course-schedule', name: 'Course Schedule', difficulty: 'Medium' },
    ],
  },
  {
    id: 'dynamic-programming',
    name: '1D Dynamic Programming',
    emoji: '📐',
    unlocked: false,
    units: [
      { id: 'climbing-stairs', name: 'Climbing Stairs', difficulty: 'Easy' },
      { id: 'house-robber', name: 'House Robber', difficulty: 'Medium' },
      { id: 'longest-palindromic', name: 'Longest Palindromic Substring', difficulty: 'Medium' },
    ],
  },
]
