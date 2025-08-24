export default class Hash {
  private static readonly MEMORY_SIZE = 1024; // 1KB memory
  private static readonly ITERATIONS = 3;
  private static readonly HASH_LENGTH = 32;

  static hash(password: string, salt: string): string {
    const passwordBytes = this.stringToBytes(password);
    const saltBytes = this.stringToBytes(salt);
    const memory = new Array<number>(this.MEMORY_SIZE).fill(0);
    const state = this.initializeState(passwordBytes, saltBytes);

    this.fillMemory(memory, state, passwordBytes, saltBytes);

    const result = this.extractResult(memory, state);
    return this.bytesToHex(result);
  }

  private static initializeState(password: number[], salt: number[]): number[] {
    const state = new Array<number>(8).fill(0);
    for (let i = 0; i < state.length; i++) {
      const pw = password[i % password.length] ?? 0;
      const sl = salt[i % salt.length] ?? 0;
      state[i] = this.simpleHash(pw ^ sl, i);
    }
    return state;
  }

  private static fillMemory(memory: number[], state: number[], password: number[], salt: number[]): void {
    for (let i = 0; i < memory.length; i++) {
      memory[i] = this.simpleHash(
        (state[i % state.length] ?? 0) ^ (password[i % password.length] ?? 0) ^ (salt[i % salt.length] ?? 0),
        i
      );
    }

    for (let iter = 0; iter < this.ITERATIONS; iter++) {
      for (let i = 0; i < memory.length; i++) {
        const prevIndex = (i - 1 + memory.length) % memory.length;
        const prevValue = memory[prevIndex] ?? 0;
        const refIndex = prevValue % memory.length;

        const mixed = (memory[i] ?? 0) ^ (memory[refIndex] ?? 0) ^ (state[i % state.length] ?? 0);
        memory[i] = this.simpleHash(mixed, i + iter);

        const stateIdx = i % state.length;
        state[stateIdx] = (state[stateIdx] ?? 0) ^ (memory[i] ?? 0);
      }
    }
  }

  private static extractResult(memory: number[], state: number[]): number[] {
    const result = [...state];
    for (let i = 0; i < this.HASH_LENGTH; i++) {
      const index = ((state[i % state.length] ?? 0) + i) % memory.length;
      const resIdx = i % result.length;
      result[resIdx] = this.simpleHash((result[resIdx] ?? 0) ^ (memory[index] ?? 0), i);
    }
    while (result.length < this.HASH_LENGTH) {
      result.push(this.simpleHash(result[result.length - 1] ?? 0, result.length));
    }
    return result.slice(0, this.HASH_LENGTH);
  }

  private static simpleHash(value: number, seed: number): number {
    let hash = value ^ seed;
    hash = ((hash >>> 16) ^ hash) * 0x45d9f3b;
    hash = ((hash >>> 16) ^ hash) * 0x45d9f3b;
    hash = (hash >>> 16) ^ hash;
    return hash >>> 0;
  }

  private static stringToBytes(str: string): number[] {
    const bytes: number[] = [];
    for (let i = 0; i < str.length; i++) {
      bytes.push(str.charCodeAt(i) & 0xff);
    }
    return bytes;
  }

  private static bytesToHex(bytes: number[]): string {
    return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // ------------------ Helper Functions ------------------

  static generateSalt(length: number = 16): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let salt = '';
    for (let i = 0; i < length; i++) {
      salt += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return salt;
  }

  static composeHash(password: string) {
    const salt = this.generateSalt();
    const hash = this.hash(password, salt);
    return { hash, salt };
  }

  static verifyPassword(password: string, hash: string, salt: string): boolean {
    const computed = this.hash(password, salt);
    return computed === hash;
  }
}
