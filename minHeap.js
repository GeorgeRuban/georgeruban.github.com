class MinHeap {
  constructor() {
    this.heap = [];
  }

  // Insert a new item into the min-heap
  push(item) {
    this.heap.push(item);
    this._bubbleUp(this.heap.length - 1);
  }

  // Remove and return the smallest item from the min-heap
  pop() {
    if (this.heap.length === 0) return null;
    const min = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._bubbleDown(0);
    }
    return min;
  }

  // Bubble up the item at index i to maintain the heap property
  _bubbleUp(i) {
    const item = this.heap[i];
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[parent].distance <= item.distance) break;
      this.heap[i] = this.heap[parent];
      i = parent;
    }
    this.heap[i] = item;
  }

  // Bubble down the item at index i to maintain the heap property
  _bubbleDown(i) {
    const item = this.heap[i];
    const length = this.heap.length;
    while (true) {
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      let smallest = i;
      if (
        left < length &&
        this.heap[left].distance < this.heap[smallest].distance
      ) {
        smallest = left;
      }
      if (
        right < length &&
        this.heap[right].distance < this.heap[smallest].distance
      ) {
        smallest = right;
      }
      if (smallest === i) break;
      this.heap[i] = this.heap[smallest];
      i = smallest;
    }
    this.heap[i] = item;
  }

  get length() {
    return this.heap.length;
  }

  get values() {
    return this.heap;
  }

  clear() {
    this.heap = [];
  }
}
