function randomString(
  length: number,
  config?: { includeSpecialCase: boolean },
) {
  let result = '';
  let characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  if (config?.includeSpecialCase) {
    characters = `${characters}!@#$%^&*)(+=._-`;
  }
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const filter = {
  alphabetOnly(word: string) {
    return word.replace(/[^a-zA-Z]/g, '');
  },
  alphaNumeric(word: string) {
    return word.replace(/[^a-zA-Z0-9]/g, '');
  },
  numericOnly(word: string) {
    return word.replace(/[^0-9]/g, '');
  },
};

export { filter, randomString };
