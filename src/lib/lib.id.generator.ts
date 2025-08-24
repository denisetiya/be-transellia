let counter = Math.floor(Math.random() * 0xFFFFFF);

export function generateId(): string {

  const timestamp = Math.floor(Date.now() / 1000).toString(16);
  
  const machineId = Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');
  
  const processId = Math.floor(Math.random() * 0xFFFF).toString(16).padStart(4, '0');  
  counter = (counter + 1) % 0xFFFFFF;
  const counterHex = counter.toString(16).padStart(6, '0');
  
  return `${timestamp}${machineId}${processId}${counterHex}`;
}

// types

export type ValidObjectId = string & { __brand: 'ValidObjectId' };

export function isValidId(id: string) {

  if (id.length !== 24) {
    return {
      success: false,
      message : 'ID tidak valid',
      error: 'ID harus terdiri dari 24 karakter'
    }
  }
  
  if (!/^[0-9a-f]+$/i.test(id)) {
    return {
      success : false,
      message: 'ID tidak valid',
      error: 'ID mengandung karakter tidak valid. Hanya karakter heksadesimal yang diperbolehkan'
    }
  }
  
  return {
    success: true,
    id: id as ValidObjectId
  }
}

