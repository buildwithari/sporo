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
      { id: 'encode-decode-strings', name: 'Encode and Decode Strings', difficulty: 'Medium' },
      { id: 'valid-sudoku', name: 'Valid Sudoku', difficulty: 'Medium' },
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
      { id: 'permutation-in-string', name: 'Permutation in String', difficulty: 'Medium' },
      { id: 'minimum-window', name: 'Minimum Window Substring', difficulty: 'Hard' },
      { id: 'sliding-window-maximum', name: 'Sliding Window Maximum', difficulty: 'Hard' },
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
      { id: 'evaluate-rpn', name: 'Evaluate Reverse Polish Notation', difficulty: 'Medium' },
      { id: 'generate-parentheses', name: 'Generate Parentheses', difficulty: 'Medium' },
      { id: 'daily-temperatures', name: 'Daily Temperatures', difficulty: 'Medium' },
      { id: 'car-fleet', name: 'Car Fleet', difficulty: 'Medium' },
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
      { id: 'koko-eating-bananas', name: 'Koko Eating Bananas', difficulty: 'Medium' },
      { id: 'find-min-rotated', name: 'Find Minimum in Rotated Sorted Array', difficulty: 'Medium' },
      { id: 'search-rotated-array', name: 'Search in Rotated Sorted Array', difficulty: 'Medium' },
      { id: 'time-based-key-value', name: 'Time Based Key-Value Store', difficulty: 'Medium' },
      { id: 'median-two-sorted-arrays', name: 'Median of Two Sorted Arrays', difficulty: 'Hard' },
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
      { id: 'remove-nth-node', name: 'Remove Nth Node From End of List', difficulty: 'Medium' },
      { id: 'copy-list-random', name: 'Copy List with Random Pointer', difficulty: 'Medium' },
      { id: 'add-two-numbers', name: 'Add Two Numbers', difficulty: 'Medium' },
      { id: 'find-duplicate-number', name: 'Find the Duplicate Number', difficulty: 'Medium' },
      { id: 'lru-cache', name: 'LRU Cache', difficulty: 'Medium' },
      { id: 'merge-k-sorted-lists', name: 'Merge K Sorted Lists', difficulty: 'Hard' },
      { id: 'reverse-nodes-k-group', name: 'Reverse Nodes in K-Group', difficulty: 'Hard' },
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
      { id: 'diameter-binary-tree', name: 'Diameter of Binary Tree', difficulty: 'Easy' },
      { id: 'balanced-binary-tree', name: 'Balanced Binary Tree', difficulty: 'Easy' },
      { id: 'same-tree', name: 'Same Tree', difficulty: 'Easy' },
      { id: 'subtree-another-tree', name: 'Subtree of Another Tree', difficulty: 'Easy' },
      { id: 'lca-bst', name: 'Lowest Common Ancestor of a BST', difficulty: 'Medium' },
      { id: 'level-order-traversal', name: 'Binary Tree Level Order Traversal', difficulty: 'Medium' },
      { id: 'right-side-view', name: 'Binary Tree Right Side View', difficulty: 'Medium' },
      { id: 'count-good-nodes', name: 'Count Good Nodes in Binary Tree', difficulty: 'Medium' },
      { id: 'validate-bst', name: 'Validate Binary Search Tree', difficulty: 'Medium' },
      { id: 'kth-smallest-bst', name: 'Kth Smallest Element in a BST', difficulty: 'Medium' },
      { id: 'construct-tree-preorder-inorder', name: 'Construct Binary Tree from Preorder and Inorder Traversal', difficulty: 'Medium' },
      { id: 'binary-tree-max-path-sum', name: 'Binary Tree Maximum Path Sum', difficulty: 'Hard' },
      { id: 'serialize-deserialize-tree', name: 'Serialize and Deserialize Binary Tree', difficulty: 'Hard' },
    ],
  },
  {
    id: 'tries',
    name: 'Tries',
    emoji: '🔤',
    unlocked: false,
    units: [
      { id: 'implement-trie', name: 'Implement Trie (Prefix Tree)', difficulty: 'Medium' },
      { id: 'design-add-search-words', name: 'Design Add and Search Words Data Structure', difficulty: 'Medium' },
      { id: 'word-search-ii', name: 'Word Search II', difficulty: 'Hard' },
    ],
  },
  {
    id: 'heap-priority-queue',
    name: 'Heap / Priority Queue',
    emoji: '🏔️',
    unlocked: false,
    units: [
      { id: 'kth-largest-stream', name: 'Kth Largest Element in a Stream', difficulty: 'Easy' },
      { id: 'last-stone-weight', name: 'Last Stone Weight', difficulty: 'Easy' },
      { id: 'k-closest-points', name: 'K Closest Points to Origin', difficulty: 'Medium' },
      { id: 'task-scheduler', name: 'Task Scheduler', difficulty: 'Medium' },
      { id: 'design-twitter', name: 'Design Twitter', difficulty: 'Medium' },
      { id: 'find-median-data-stream', name: 'Find Median from Data Stream', difficulty: 'Hard' },
    ],
  },
  {
    id: 'backtracking',
    name: 'Backtracking',
    emoji: '🔀',
    unlocked: false,
    units: [
      { id: 'subsets', name: 'Subsets', difficulty: 'Medium' },
      { id: 'combination-sum', name: 'Combination Sum', difficulty: 'Medium' },
      { id: 'permutations', name: 'Permutations', difficulty: 'Medium' },
      { id: 'subsets-ii', name: 'Subsets II', difficulty: 'Medium' },
      { id: 'combination-sum-ii', name: 'Combination Sum II', difficulty: 'Medium' },
      { id: 'word-search', name: 'Word Search', difficulty: 'Medium' },
      { id: 'palindrome-partitioning', name: 'Palindrome Partitioning', difficulty: 'Medium' },
      { id: 'letter-combinations-phone', name: 'Letter Combinations of a Phone Number', difficulty: 'Medium' },
      { id: 'n-queens', name: 'N-Queens', difficulty: 'Hard' },
    ],
  },
  {
    id: 'graphs',
    name: 'Graphs',
    emoji: '📊',
    unlocked: false,
    units: [
      { id: 'number-of-islands', name: 'Number of Islands', difficulty: 'Medium' },
      { id: 'max-area-island', name: 'Max Area of Island', difficulty: 'Medium' },
      { id: 'clone-graph', name: 'Clone Graph', difficulty: 'Medium' },
      { id: 'walls-and-gates', name: 'Walls and Gates', difficulty: 'Medium' },
      { id: 'rotting-oranges', name: 'Rotting Oranges', difficulty: 'Medium' },
      { id: 'pacific-atlantic-water-flow', name: 'Pacific Atlantic Water Flow', difficulty: 'Medium' },
      { id: 'surrounded-regions', name: 'Surrounded Regions', difficulty: 'Medium' },
      { id: 'course-schedule', name: 'Course Schedule', difficulty: 'Medium' },
      { id: 'course-schedule-ii', name: 'Course Schedule II', difficulty: 'Medium' },
      { id: 'graph-valid-tree', name: 'Graph Valid Tree', difficulty: 'Medium' },
      { id: 'number-connected-components', name: 'Number of Connected Components in an Undirected Graph', difficulty: 'Medium' },
      { id: 'redundant-connection', name: 'Redundant Connection', difficulty: 'Medium' },
      { id: 'word-ladder', name: 'Word Ladder', difficulty: 'Hard' },
    ],
  },
  {
    id: 'advanced-graphs',
    name: 'Advanced Graphs',
    emoji: '🕸️',
    unlocked: false,
    units: [
      { id: 'reconstruct-itinerary', name: 'Reconstruct Itinerary', difficulty: 'Hard' },
      { id: 'min-cost-connect-points', name: 'Min Cost to Connect All Points', difficulty: 'Medium' },
      { id: 'network-delay-time', name: 'Network Delay Time', difficulty: 'Medium' },
      { id: 'swim-in-rising-water', name: 'Swim in Rising Water', difficulty: 'Hard' },
      { id: 'alien-dictionary', name: 'Alien Dictionary', difficulty: 'Hard' },
      { id: 'cheapest-flights-k-stops', name: 'Cheapest Flights Within K Stops', difficulty: 'Medium' },
    ],
  },
  {
    id: 'dynamic-programming',
    name: '1D Dynamic Programming',
    emoji: '📐',
    unlocked: false,
    units: [
      { id: 'climbing-stairs', name: 'Climbing Stairs', difficulty: 'Easy' },
      { id: 'min-cost-climbing-stairs', name: 'Min Cost Climbing Stairs', difficulty: 'Easy' },
      { id: 'house-robber', name: 'House Robber', difficulty: 'Medium' },
      { id: 'house-robber-ii', name: 'House Robber II', difficulty: 'Medium' },
      { id: 'longest-palindromic', name: 'Longest Palindromic Substring', difficulty: 'Medium' },
      { id: 'palindromic-substrings', name: 'Palindromic Substrings', difficulty: 'Medium' },
      { id: 'decode-ways', name: 'Decode Ways', difficulty: 'Medium' },
      { id: 'coin-change', name: 'Coin Change', difficulty: 'Medium' },
      { id: 'max-product-subarray', name: 'Maximum Product Subarray', difficulty: 'Medium' },
      { id: 'word-break', name: 'Word Break', difficulty: 'Medium' },
      { id: 'longest-increasing-subsequence', name: 'Longest Increasing Subsequence', difficulty: 'Medium' },
      { id: 'partition-equal-subset-sum', name: 'Partition Equal Subset Sum', difficulty: 'Medium' },
    ],
  },
  {
    id: '2d-dynamic-programming',
    name: '2D Dynamic Programming',
    emoji: '🧮',
    unlocked: false,
    units: [
      { id: 'unique-paths', name: 'Unique Paths', difficulty: 'Medium' },
      { id: 'longest-common-subsequence', name: 'Longest Common Subsequence', difficulty: 'Medium' },
      { id: 'best-time-stock-cooldown', name: 'Best Time to Buy and Sell Stock with Cooldown', difficulty: 'Medium' },
      { id: 'coin-change-ii', name: 'Coin Change II', difficulty: 'Medium' },
      { id: 'target-sum', name: 'Target Sum', difficulty: 'Medium' },
      { id: 'interleaving-string', name: 'Interleaving String', difficulty: 'Medium' },
      { id: 'longest-increasing-path-matrix', name: 'Longest Increasing Path in a Matrix', difficulty: 'Hard' },
      { id: 'distinct-subsequences', name: 'Distinct Subsequences', difficulty: 'Hard' },
      { id: 'edit-distance', name: 'Edit Distance', difficulty: 'Medium' },
      { id: 'burst-balloons', name: 'Burst Balloons', difficulty: 'Hard' },
      { id: 'regular-expression-matching', name: 'Regular Expression Matching', difficulty: 'Hard' },
    ],
  },
  {
    id: 'greedy',
    name: 'Greedy',
    emoji: '💡',
    unlocked: false,
    units: [
      { id: 'maximum-subarray', name: 'Maximum Subarray', difficulty: 'Medium' },
      { id: 'jump-game', name: 'Jump Game', difficulty: 'Medium' },
      { id: 'jump-game-ii', name: 'Jump Game II', difficulty: 'Medium' },
      { id: 'gas-station', name: 'Gas Station', difficulty: 'Medium' },
      { id: 'hand-of-straights', name: 'Hand of Straights', difficulty: 'Medium' },
      { id: 'merge-triplets', name: 'Merge Triplets to Form Target Triplet', difficulty: 'Medium' },
      { id: 'partition-labels', name: 'Partition Labels', difficulty: 'Medium' },
      { id: 'valid-parenthesis-string', name: 'Valid Parenthesis String', difficulty: 'Medium' },
    ],
  },
  {
    id: 'intervals',
    name: 'Intervals',
    emoji: '📏',
    unlocked: false,
    units: [
      { id: 'insert-interval', name: 'Insert Interval', difficulty: 'Medium' },
      { id: 'merge-intervals', name: 'Merge Intervals', difficulty: 'Medium' },
      { id: 'non-overlapping-intervals', name: 'Non-overlapping Intervals', difficulty: 'Medium' },
      { id: 'meeting-rooms', name: 'Meeting Rooms', difficulty: 'Easy' },
      { id: 'meeting-rooms-ii', name: 'Meeting Rooms II', difficulty: 'Medium' },
      { id: 'minimum-interval-query', name: 'Minimum Interval to Include Each Query', difficulty: 'Hard' },
    ],
  },
  {
    id: 'math-geometry',
    name: 'Math & Geometry',
    emoji: '📐',
    unlocked: false,
    units: [
      { id: 'rotate-image', name: 'Rotate Image', difficulty: 'Medium' },
      { id: 'spiral-matrix', name: 'Spiral Matrix', difficulty: 'Medium' },
      { id: 'set-matrix-zeroes', name: 'Set Matrix Zeroes', difficulty: 'Medium' },
      { id: 'happy-number', name: 'Happy Number', difficulty: 'Easy' },
      { id: 'plus-one', name: 'Plus One', difficulty: 'Easy' },
      { id: 'pow-x-n', name: 'Pow(x, n)', difficulty: 'Medium' },
      { id: 'multiply-strings', name: 'Multiply Strings', difficulty: 'Medium' },
      { id: 'detect-squares', name: 'Detect Squares', difficulty: 'Medium' },
    ],
  },
  {
    id: 'bit-manipulation',
    name: 'Bit Manipulation',
    emoji: '⚙️',
    unlocked: false,
    units: [
      { id: 'single-number', name: 'Single Number', difficulty: 'Easy' },
      { id: 'number-of-1-bits', name: 'Number of 1 Bits', difficulty: 'Easy' },
      { id: 'counting-bits', name: 'Counting Bits', difficulty: 'Easy' },
      { id: 'reverse-bits', name: 'Reverse Bits', difficulty: 'Easy' },
      { id: 'missing-number', name: 'Missing Number', difficulty: 'Easy' },
      { id: 'sum-of-two-integers', name: 'Sum of Two Integers', difficulty: 'Medium' },
      { id: 'reverse-integer', name: 'Reverse Integer', difficulty: 'Medium' },
    ],
  },
]
