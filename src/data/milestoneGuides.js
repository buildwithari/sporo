// Pre-written concept guides for each milestone.
// Format matches what MilestonePage expects: { intro, sections, keyInsights }

const guides = {
  'arrays-hashing': {
    intro:
      'Arrays and Hash Tables are the bread and butter of DSA. An array is just a list of items stored in order. A hash table (called HashMap or HashSet in Java) lets you store and look up items almost instantly — in O(1) time. Together, they solve a huge class of problems that would otherwise require nested loops.',
    sections: [
      {
        title: 'What is an Array?',
        content:
          'An array is a fixed-size container that holds elements of the same type in sequential memory. You access any element by its index in O(1) time, but searching for a value takes O(n) — you have to check each element one by one.',
        codeExample: `int[] nums = {3, 1, 4, 1, 5};
System.out.println(nums[2]); // 4 — instant access by index`,
      },
      {
        title: 'What is a Hash Table?',
        content:
          'A hash table maps keys to values using a hash function. When you put a key in, it gets converted to an index in memory. This is why lookups are O(1) — instead of searching through everything, you jump straight to the right spot. Java gives you HashMap (key → value) and HashSet (unique values only).',
        codeExample: `HashMap<Integer, Integer> map = new HashMap<>();
map.put(7, 42);         // store: key=7, value=42
map.get(7);             // retrieve: 42  — O(1)
map.containsKey(7);     // check: true   — O(1)

HashSet<Integer> set = new HashSet<>();
set.add(5);
set.contains(5);        // true — O(1)`,
      },
      {
        title: 'Why combine them?',
        content:
          'Most "find a pair / find a duplicate / group things" problems are solved by scanning the array once and using a hash table to remember what you\'ve seen. Instead of a nested loop (O(n²)), you get a single pass (O(n)). The hash table trades a bit of memory for a huge speed win.',
        codeExample: `// Has the array seen this number before?
Set<Integer> seen = new HashSet<>();
for (int num : nums) {
    if (seen.contains(num)) return true; // duplicate found
    seen.add(num);
}
return false;`,
      },
      {
        title: 'Counting with a frequency map',
        content:
          'A very common pattern: use a HashMap to count how many times each element appears. The key is the element, the value is its count. This lets you answer "how many times did X appear?" in O(1) after a single O(n) scan.',
        codeExample: `Map<Integer, Integer> freq = new HashMap<>();
for (int num : nums) {
    freq.put(num, freq.getOrDefault(num, 0) + 1);
}
// freq.get(3) now tells you how many times 3 appeared`,
      },
    ],
    keyInsights: [
      'When you see "find duplicate" or "find pair", think HashSet or HashMap first.',
      'Trading O(n) space for O(n) → O(1) time is almost always worth it.',
      'getOrDefault(key, 0) is your best friend for frequency counting.',
      'HashSet = "have I seen this before?", HashMap = "how many times / what was paired with this?"',
    ],
  },

  'two-pointers': {
    intro:
      'Two Pointers is a technique where you use two variables to track positions in an array or string simultaneously, moving them toward each other (or in the same direction) to avoid nested loops. It turns many O(n²) problems into O(n).',
    sections: [
      {
        title: 'The core idea',
        content:
          'Instead of a nested loop that checks every pair, you place one pointer at the start and one at the end, then move them inward based on some condition. Because each pointer only moves forward, the total iterations is O(n) — not O(n²).',
        codeExample: `int left = 0, right = nums.length - 1;
while (left < right) {
    // do something with nums[left] and nums[right]
    left++;   // or
    right--;  // move based on condition
}`,
      },
      {
        title: 'When to use it',
        content:
          'Two pointers works best on sorted arrays (or strings). If the array is sorted, you have a guarantee about which direction to move a pointer. Typical problems: find two numbers that sum to a target, check if a string is a palindrome, remove duplicates in-place.',
        codeExample: `// Is this string a palindrome?
int l = 0, r = s.length() - 1;
while (l < r) {
    if (s.charAt(l) != s.charAt(r)) return false;
    l++;
    r--;
}
return true;`,
      },
      {
        title: 'Same-direction two pointers',
        content:
          'Sometimes both pointers start at the left and move right, but at different speeds. This is useful for problems like "remove duplicates" or "find a cycle". The slow pointer marks the boundary of valid elements; the fast pointer explores ahead.',
        codeExample: `// Remove duplicates from sorted array in-place
int slow = 1;
for (int fast = 1; fast < nums.length; fast++) {
    if (nums[fast] != nums[fast - 1]) {
        nums[slow++] = nums[fast];
    }
}`,
      },
    ],
    keyInsights: [
      'Two pointers only works reliably on sorted data — sorting first (O(n log n)) is often still better than a brute-force O(n²).',
      'Ask yourself: "can I make a decision about which pointer to move based on the current values?" If yes, two pointers works.',
      'Opposite-direction pointers → finding pairs. Same-direction → filtering or cycle detection.',
      'Always check your loop condition — off-by-one errors are the #1 bug here.',
    ],
  },

  'sliding-window': {
    intro:
      'Sliding Window is a pattern for processing contiguous subarrays or substrings efficiently. Instead of recomputing from scratch for every window, you "slide" the window by adding one element on the right and removing one on the left — turning O(n²) into O(n).',
    sections: [
      {
        title: 'Fixed-size window',
        content:
          'When the window size is given (e.g. "find the max sum of k consecutive elements"), you first build the initial window, then slide it: subtract the element leaving the left, add the element entering the right. No nested loop needed.',
        codeExample: `int sum = 0;
for (int i = 0; i < k; i++) sum += nums[i]; // build first window
int max = sum;
for (int i = k; i < nums.length; i++) {
    sum += nums[i] - nums[i - k];  // slide
    max = Math.max(max, sum);
}`,
      },
      {
        title: 'Variable-size window',
        content:
          'When you need the longest/shortest subarray that satisfies a condition, use a dynamic window. Expand the right pointer to grow the window; shrink the left pointer when the window becomes invalid. This is the more common (and trickier) version.',
        codeExample: `int left = 0;
// e.g. longest substring with no repeating characters
Set<Character> window = new HashSet<>();
int maxLen = 0;
for (int right = 0; right < s.length(); right++) {
    while (window.contains(s.charAt(right))) {
        window.remove(s.charAt(left++)); // shrink from left
    }
    window.add(s.charAt(right));
    maxLen = Math.max(maxLen, right - left + 1);
}`,
      },
      {
        title: 'What goes inside the window?',
        content:
          'The window often tracks a count, a sum, or a frequency map of its contents. When you slide the window, update that data structure incrementally — don\'t recompute it from scratch. The power of sliding window is that each element enters and exits the window exactly once: O(n) total.',
        codeExample: `Map<Character, Integer> freq = new HashMap<>();
// Add right element:
freq.put(c, freq.getOrDefault(c, 0) + 1);
// Remove left element:
freq.put(c, freq.get(c) - 1);
if (freq.get(c) == 0) freq.remove(c);`,
      },
    ],
    keyInsights: [
      '"Subarray / substring" + "contiguous" + "max/min length" → think sliding window.',
      'Fixed window: track what enters and exits. Variable window: expand right, shrink left when invalid.',
      'Each element is added once and removed once — that\'s why it\'s O(n).',
      'The window state (sum, frequency map, set) is updated incrementally, never recomputed.',
    ],
  },

  'stack': {
    intro:
      'A Stack is a Last-In, First-Out (LIFO) data structure — like a stack of plates. Whatever you put on top is the first thing you take off. Stacks are surprisingly powerful for problems involving matching pairs, tracking the "most recent" thing, or finding the next greater/smaller element.',
    sections: [
      {
        title: 'How a stack works',
        content:
          'You only interact with the top of the stack. Push to add, pop to remove, peek to look at the top without removing. In Java, use Deque<Integer> (ArrayDeque) instead of the legacy Stack class — it\'s faster.',
        codeExample: `Deque<Integer> stack = new ArrayDeque<>();
stack.push(1);       // [1]
stack.push(2);       // [1, 2]
stack.push(3);       // [1, 2, 3]
stack.pop();         // returns 3  → [1, 2]
stack.peek();        // returns 2  → [1, 2] (no change)`,
      },
      {
        title: 'Matching pairs',
        content:
          'Stacks are perfect for checking matching brackets, tags, or any open/close pair. Push when you see an opener, pop and verify when you see a closer. If the stack is empty at the end, everything matched.',
        codeExample: `for (char c : s.toCharArray()) {
    if (c == '(') stack.push(c);
    else if (c == ')') {
        if (stack.isEmpty()) return false;
        stack.pop();
    }
}
return stack.isEmpty();`,
      },
      {
        title: 'Monotonic stack',
        content:
          'A monotonic stack maintains elements in increasing or decreasing order. It\'s used to find the "next greater element" or "largest rectangle" type problems. When a new element breaks the order, you pop — and that pop is the answer for each popped element.',
        codeExample: `// Next greater element for each position
int[] result = new int[nums.length];
Deque<Integer> stack = new ArrayDeque<>(); // stores indices
for (int i = 0; i < nums.length; i++) {
    while (!stack.isEmpty() && nums[i] > nums[stack.peek()]) {
        result[stack.pop()] = nums[i]; // nums[i] is the next greater
    }
    stack.push(i);
}`,
      },
    ],
    keyInsights: [
      'If a problem involves "the most recent thing" or "undo the last action", think stack.',
      'Matching brackets is the canonical stack problem — memorize that pattern.',
      'A monotonic stack processes each element at most twice (push + pop) → O(n).',
      'Use ArrayDeque in Java, not Stack. Stack extends Vector and is synchronized (slow).',
    ],
  },

  'binary-search': {
    intro:
      'Binary Search finds a target in a sorted collection in O(log n) time by halving the search space with each step. Instead of checking every element, you check the middle — and immediately eliminate half the remaining elements. It\'s faster than you think: log₂(1,000,000) ≈ 20.',
    sections: [
      {
        title: 'The classic pattern',
        content:
          'Keep two pointers: left and right. Check the midpoint. If mid is your target, done. If target is larger, search the right half. If smaller, search the left half. Repeat until found or the window collapses.',
        codeExample: `int left = 0, right = nums.length - 1;
while (left <= right) {
    int mid = left + (right - left) / 2; // avoids integer overflow
    if (nums[mid] == target) return mid;
    else if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
}
return -1; // not found`,
      },
      {
        title: 'Finding a boundary, not just an element',
        content:
          'Many binary search problems aren\'t "find exactly X" — they\'re "find the leftmost position where X holds". These use a slightly different template: you never return early, you just keep narrowing, recording the best candidate as you go.',
        codeExample: `// Find leftmost index where nums[i] >= target
int left = 0, right = nums.length;
while (left < right) {
    int mid = left + (right - left) / 2;
    if (nums[mid] >= target) right = mid;  // could be answer, keep looking left
    else left = mid + 1;
}
return left;`,
      },
      {
        title: 'Binary search on the answer',
        content:
          'You don\'t always binary search the array itself. Often you binary search the answer space: "can I achieve X?" If yes, try harder. If no, try easier. This works whenever the answer has a monotonic property — valid answers form one contiguous block.',
        codeExample: `// e.g. "minimum capacity to ship packages in D days"
int left = maxWeight, right = totalWeight;
while (left < right) {
    int mid = left + (right - left) / 2;
    if (canShip(mid, D)) right = mid; // mid works, try smaller
    else left = mid + 1;              // mid too small
}
return left;`,
      },
    ],
    keyInsights: [
      'Always use mid = left + (right - left) / 2 to avoid integer overflow.',
      '"Find minimum X such that condition holds" → binary search on the answer.',
      'The hardest part is getting the boundary conditions right (< vs <=, mid+1 vs mid). Think carefully about which half to exclude.',
      'If you can ask "is this answer feasible?" in O(n), you can find the optimal answer in O(n log n) with binary search.',
    ],
  },

  'linked-list': {
    intro:
      'A Linked List is a chain of nodes where each node holds a value and a pointer to the next node. Unlike arrays, there\'s no random access — you must traverse from the head. But insertions and deletions are O(1) once you\'re at the right position. Most linked list problems are solved with careful pointer manipulation.',
    sections: [
      {
        title: 'How a linked list works',
        content:
          'Each node has a val and a next pointer. The last node points to null. You always start from the head. There\'s no index — to get to node 5, you follow next five times. That\'s O(n) to access, but O(1) to insert or delete once you\'re there.',
        codeExample: `class ListNode {
    int val;
    ListNode next;
    ListNode(int val) { this.val = val; }
}
// Traverse:
ListNode curr = head;
while (curr != null) {
    System.out.println(curr.val);
    curr = curr.next;
}`,
      },
      {
        title: 'Pointer manipulation',
        content:
          'Most linked list operations are about carefully reassigning next pointers without losing references. Always save a reference before overwriting a pointer. A common mistake: doing curr.next = prev before saving curr.next = curr.next — you\'ve just lost the rest of the list.',
        codeExample: `// Reverse a linked list
ListNode prev = null, curr = head;
while (curr != null) {
    ListNode next = curr.next; // save before overwrite!
    curr.next = prev;
    prev = curr;
    curr = next;
}
return prev; // new head`,
      },
      {
        title: 'Fast and slow pointers',
        content:
          'Two pointers moving at different speeds solve linked list problems elegantly. The fast pointer moves 2 steps per iteration, the slow moves 1. When fast reaches the end, slow is at the middle. If fast ever equals slow (after starting), there\'s a cycle.',
        codeExample: `// Detect cycle
ListNode slow = head, fast = head;
while (fast != null && fast.next != null) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow == fast) return true; // cycle!
}
return false;`,
      },
      {
        title: 'Dummy head trick',
        content:
          'When the head node might change (e.g. you\'re deleting or inserting at the front), add a dummy node before the head. This removes special-casing — every node including the first one has a predecessor, so your code is uniform.',
        codeExample: `ListNode dummy = new ListNode(0);
dummy.next = head;
ListNode curr = dummy;
// ... manipulate list ...
return dummy.next; // the actual new head`,
      },
    ],
    keyInsights: [
      'Always save next before changing curr.next — it\'s the most common linked list bug.',
      'Dummy head node eliminates head-special-casing and simplifies most problems.',
      'Fast/slow pointers: cycle detection, finding the middle, finding the Nth from end.',
      'Draw out the pointer changes on paper before coding. Linked list bugs are hard to debug mentally.',
    ],
  },

  'trees': {
    intro:
      'A tree is a hierarchical data structure where each node has a value and zero or more children. Binary trees (at most 2 children: left and right) are the most common in DSA. Almost every tree problem is solved with recursion — you define what to do at one node and trust the recursive calls to handle the rest.',
    sections: [
      {
        title: 'Tree basics',
        content:
          'The root is the topmost node. Nodes with no children are called leaves. The height of a tree is the length of the longest path from root to a leaf. In a balanced binary tree with n nodes, the height is O(log n) — that\'s why tree operations are fast.',
        codeExample: `class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int val) { this.val = val; }
}`,
      },
      {
        title: 'The recursive mindset',
        content:
          'Every tree function follows the same template: handle the base case (null node), make recursive calls on left and right children, then combine the results. Trust the recursion — don\'t try to trace it mentally for every node.',
        codeExample: `// Max depth of a binary tree
int maxDepth(TreeNode root) {
    if (root == null) return 0;              // base case
    int left  = maxDepth(root.left);         // trust this
    int right = maxDepth(root.right);        // trust this
    return 1 + Math.max(left, right);        // combine
}`,
      },
      {
        title: 'Tree traversals',
        content:
          'There are three DFS traversal orders: inorder (left → root → right), preorder (root → left → right), postorder (left → right → root). Inorder on a BST gives you sorted output. BFS (level-order) uses a queue and visits nodes level by level.',
        codeExample: `// Inorder traversal
void inorder(TreeNode root, List<Integer> res) {
    if (root == null) return;
    inorder(root.left, res);
    res.add(root.val);        // process node BETWEEN children
    inorder(root.right, res);
}`,
      },
      {
        title: 'Binary Search Trees (BST)',
        content:
          'A BST has a special property: every node in the left subtree is smaller, every node in the right is larger. This lets you search, insert, and delete in O(log n) for a balanced tree. Many problems exploit this ordering property.',
        codeExample: `// Search in BST
TreeNode search(TreeNode root, int target) {
    if (root == null || root.val == target) return root;
    if (target < root.val) return search(root.left, target);
    return search(root.right, target);
}`,
      },
    ],
    keyInsights: [
      'If you can solve a problem for one node given its children\'s answers, recursion handles the rest.',
      'Base case is almost always: if (root == null) return some_default.',
      'Inorder BST traversal = sorted order. Use this whenever BST ordering matters.',
      'When a recursive solution is too deep (stack overflow), convert to iterative using an explicit stack.',
    ],
  },

  'graphs': {
    intro:
      'A graph is a set of nodes (vertices) connected by edges. Unlike trees, graphs can have cycles, disconnected components, and bidirectional edges. They model real-world networks — roads, social connections, dependencies. Almost all graph problems boil down to some form of traversal: BFS or DFS.',
    sections: [
      {
        title: 'Representing a graph',
        content:
          'The most common representation in coding interviews is an adjacency list: a map (or array) where each node maps to a list of its neighbors. For a grid problem, the graph is implicit — each cell is a node, and its neighbors are the 4 adjacent cells.',
        codeExample: `// Build adjacency list from edge list
Map<Integer, List<Integer>> adj = new HashMap<>();
for (int[] edge : edges) {
    adj.computeIfAbsent(edge[0], k -> new ArrayList<>()).add(edge[1]);
    adj.computeIfAbsent(edge[1], k -> new ArrayList<>()).add(edge[0]);
}`,
      },
      {
        title: 'Depth-First Search (DFS)',
        content:
          'DFS explores as far as possible down one path before backtracking. Use a visited set to avoid revisiting nodes (and infinite loops in cyclic graphs). Recursive DFS is clean; iterative DFS uses an explicit stack.',
        codeExample: `Set<Integer> visited = new HashSet<>();

void dfs(int node, Map<Integer, List<Integer>> adj) {
    visited.add(node);
    for (int neighbor : adj.getOrDefault(node, List.of())) {
        if (!visited.contains(neighbor)) {
            dfs(neighbor, adj);
        }
    }
}`,
      },
      {
        title: 'Breadth-First Search (BFS)',
        content:
          'BFS explores level by level, visiting all neighbors before going deeper. Use a queue. BFS is the go-to for shortest path in an unweighted graph — the first time you reach a node is guaranteed to be via the shortest path.',
        codeExample: `Queue<Integer> queue = new LinkedList<>();
Set<Integer> visited = new HashSet<>();
queue.offer(start);
visited.add(start);
int steps = 0;
while (!queue.isEmpty()) {
    int size = queue.size();
    for (int i = 0; i < size; i++) {
        int node = queue.poll();
        for (int neighbor : adj.getOrDefault(node, List.of())) {
            if (!visited.contains(neighbor)) {
                visited.add(neighbor);
                queue.offer(neighbor);
            }
        }
    }
    steps++;
}`,
      },
    ],
    keyInsights: [
      'Always maintain a visited set in graph traversal — without it, you\'ll loop forever on cyclic graphs.',
      'BFS = shortest path in unweighted graphs. DFS = connectivity, cycle detection, topological sort.',
      'Grid problems ARE graph problems. Treat each cell as a node; neighbors are up/down/left/right.',
      'Connected components: run DFS/BFS from every unvisited node, count how many times you start fresh.',
    ],
  },

  'dynamic-programming': {
    intro:
      'Dynamic Programming (DP) solves problems by breaking them into overlapping subproblems and storing the results so you don\'t recompute them. If you\'ve ever solved a recursion problem and noticed it recalculating the same thing over and over, DP is the fix. 1D DP uses a single array to store subproblem results.',
    sections: [
      {
        title: 'The key insight: overlapping subproblems',
        content:
          'Plain recursion recomputes the same subproblems exponentially. DP solves each subproblem exactly once and stores it. There are two styles: top-down (recursive + memoization: cache the result of each call) and bottom-up (iterative: build the solution from smaller subproblems up to the full one).',
        codeExample: `// Fibonacci — naive recursion: O(2^n)
int fib(int n) { return n <= 1 ? n : fib(n-1) + fib(n-2); }

// With memoization: O(n)
int[] memo = new int[n + 1];
Arrays.fill(memo, -1);
int fib(int n) {
    if (n <= 1) return n;
    if (memo[n] != -1) return memo[n];
    return memo[n] = fib(n-1) + fib(n-2);
}`,
      },
      {
        title: 'Bottom-up DP (tabulation)',
        content:
          'Instead of recursing down and caching, you build up from the base cases. Define dp[i] as "the answer for subproblem i". Fill the array in order from small to large. The final answer is usually dp[n].',
        codeExample: `// Climbing stairs: how many ways to reach step n?
// At each step, you can climb 1 or 2 stairs.
int[] dp = new int[n + 1];
dp[0] = 1; // one way to stand at the bottom
dp[1] = 1;
for (int i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2]; // came from step i-1 or i-2
}
return dp[n];`,
      },
      {
        title: 'Defining the subproblem',
        content:
          'The hardest part of DP is the definition. Ask: "what does dp[i] represent?" Be precise. For house robber: dp[i] = max money robbing houses 0..i. For longest increasing subsequence: dp[i] = length of longest subsequence ending at index i. The recurrence (how dp[i] depends on smaller values) follows naturally.',
        codeExample: `// House Robber: can't rob adjacent houses
// dp[i] = max money from houses 0..i
dp[0] = nums[0];
dp[1] = Math.max(nums[0], nums[1]);
for (int i = 2; i < nums.length; i++) {
    dp[i] = Math.max(dp[i - 1],        // skip house i
                     dp[i - 2] + nums[i]); // rob house i
}
return dp[nums.length - 1];`,
      },
    ],
    keyInsights: [
      'Start with brute-force recursion. If it\'s slow because of repeated calls, add memoization → that\'s top-down DP.',
      'Bottom-up DP avoids recursion overhead and is usually cleaner once you know the recurrence.',
      'Define dp[i] precisely before writing any code. Vague definitions lead to wrong recurrences.',
      'Many 1D DP problems only need the last 1 or 2 dp values — you can optimize space from O(n) to O(1).',
    ],
  },
}

export function getMilestoneGuide(milestoneId) {
  return guides[milestoneId] ?? null
}
