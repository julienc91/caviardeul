import { encode } from "./encryption";

export const firstGameDate = new Date(2022, 4, 27);
const clearTextPageList: string[] = [];

const shuffle = <T>(array: T[]): void => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
};

const getEncodePageList = (): string[] => {
  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw Error("Missing encryption key");
  }
  const encoded = clearTextPageList.map((pageName: string) =>
    encode(pageName, encryptionKey)
  );
  shuffle(encoded);
  return encoded;
};

export const encodedPageList = [
  "U2FsdGVkX19MKbLX4sRpHZJ6bczF+GyeBgxmFaIl/w4=",
  "U2FsdGVkX1/zE8MG1kvEDK7OJ/CQVwLZvJyolwITn+w=",
  "U2FsdGVkX1/eYnyK8oz7IjwdR47c1pahAYGeKBNZZDE=",
  "U2FsdGVkX1+sUbnsvlo3SOaLmwUUQlW2rSxga8BhV+k=",
  "U2FsdGVkX1/8K45666EBnMRvrDROg+jH3NXWD4OW5DA=",
  "U2FsdGVkX18F2oF1lx3JajwmX1t63KeI0Tr6pqvJIiM=",
  "U2FsdGVkX18FKGv2u/pgLyX07hc3SzHtmE0jQbi1M+o=",
  "U2FsdGVkX18iNQflibxBsPx8z0HMQgt8pLoEPiZ5f2o=",
  "U2FsdGVkX1/ZZZd5apE7XbwiZP03//Q65DAbXR2pT3c=",
  "U2FsdGVkX1/Mx1nH5EXxS5Pe/sliCy4m5aJNH7CbtFE=",
  "U2FsdGVkX1/XUdQzY02kYSWM1HYjTco1i43w1jjvi0aM9GlOEePgXI2w+35JQldD",
  "U2FsdGVkX1+n9LfJf/3xHUviitSNb6nQWu7wuG7x+Q8=",
  "U2FsdGVkX1+beIxAiT0NmVsm4xLX5G590XS6+LKwawA=",
  "U2FsdGVkX18jbh69G2qL+e6onA2ZLKjab1wcmjjQlrM=",
  "U2FsdGVkX19DqkMTPoHdPHhWObYlsxROSCMg2Llirj4UJHXG7MS1BNPANP+SzGkM",
  "U2FsdGVkX19VM+raesVkl84AA97sFsgM2PkXo7+bDps=",
  "U2FsdGVkX1+X2g5Mu1Sp5sdFXFrT2m4nlqXQlT6mLTY=",
  "U2FsdGVkX1+DwtIOY1IlRx+ddGQTjA6l2tdWKDtyNF8=",
  "U2FsdGVkX188VFgixII/KIVGpBeOpRR2ctb45hMaQno=",
  "U2FsdGVkX19c07XoYAwIkrHCKLvBd7/zaXI8zbBUW0o=",
  "U2FsdGVkX1+ccsHdHxr4rjWf1oNimCTk+eVCjlZPB+I=",
  "U2FsdGVkX1/dR8kONM4ig3TQMiBa6hCFZNOFFhKuHYc=",
  "U2FsdGVkX19Dq1Jfs2W6V8YY/+PA9xDDmaBS3FMk3fM=",
  "U2FsdGVkX1+E9ewMy0f5pdVtIIhuR76xIGqn5+tiM3c=",
  "U2FsdGVkX1+EG5a9D3k0+RzNlwcrkySCjE7YNicSGcI=",
  "U2FsdGVkX1/Eb1f/wOXVOfVPJHJATpOO4aUOQFwG45I=",
  "U2FsdGVkX1/zdpRpPOg3hQnsfZahCD9SYthLZxKBEFQ=",
  "U2FsdGVkX19/KYibx0TSZDb4GSeaRcSGi3noWct9KIg=",
  "U2FsdGVkX1+cHPP3whmNNXXppHQoFkbvP8uQ6HUvkm0=",
  "U2FsdGVkX19G7vLiDKMo38whYyIGO1f7PbfEaVMaPvA=",
  "U2FsdGVkX19bw9nV6+HRiqRV2qPl812QajxyxDS1jr0=",
  "U2FsdGVkX1+wlwBJ8ZdzpD2kGrVQJMmmZREuB+eeoJg=",
  "U2FsdGVkX18STPc1ogt9EIxvvcqf8dcgE5jn57Q+ye8=",
  "U2FsdGVkX1+a8nYzuwJUvuAllJSm1x6UdycGD2Haz4E=",
  "U2FsdGVkX19hzA+lZrCsvkjyNON4JsWcw17I/vgrwbU=",
  "U2FsdGVkX18mXhQ0Af21SI6ZDlsGWnTfXQMXJ8t69E0=",
  "U2FsdGVkX1/EvaFw0RGh1eIUaTxBNgh3Pd3ZQWCfAw2StSr5nUVR0HjVBRqovZRA",
  "U2FsdGVkX1+iMmNRcLV/0hV83W7oTW55uOrhAXjOgSI=",
  "U2FsdGVkX19sLsoW5ruLWT9zqRBQx2X+1vlQ+IXvXY8=",
  "U2FsdGVkX1+m5pjhXmXFQYt0MYZtWjzzPCppT3oQ/Qs=",
  "U2FsdGVkX188oFd8i8oiTSyyHdzloHz+sRuXkJBx39U=",
  "U2FsdGVkX1/wFdc4HTQjO6unoi+VbfONwVDy2jC+Hj0=",
  "U2FsdGVkX18i/C4+qgz5YJ7S/+Roz98C8kY0roVLE1E=",
  "U2FsdGVkX1/OGGKxHtGTmR6wVzIf+oYx9q2oOZAyItA=",
  "U2FsdGVkX18zGzH9ITA4v/5C3wGjIX5HSsiQOtF2VYQ=",
  "U2FsdGVkX1//NrT03WSjfIvsYR4DJ9LV5MYvvFlt1uE=",
  "U2FsdGVkX197o96zIk30tVN7fb9kmlb0V5bKkORrw3k=",
  "U2FsdGVkX18W/pwl0dgkL+qjKEbNuRsKOFG/4I78BsY=",
  "U2FsdGVkX1/6TZK8MkxNJ0kqC1uenDenPisjPg7ATzQ=",
  "U2FsdGVkX18SzOZLsbFPgkXHL3zgSpIf6dP/Y+QtTd8=",
  "U2FsdGVkX19OopqLpAwhJWyau9GOfGF5FLNCPPGb9JQ=",
  "U2FsdGVkX195rF/saVpInX5T9X3vr1E9LpesRjCojdKHA8w3LTQDmvT0J+x7CvKJ",
  "U2FsdGVkX18Wsfzh4zTKHE9/C2Uh+ji/X3U9nHjMS6g=",
  "U2FsdGVkX1+yyWbdhLe1/dKIchYe1kYrJnWH7qFH/y8=",
  "U2FsdGVkX18EqxT6+aknJkYny+skGM1j//QmFoQabss=",
  "U2FsdGVkX1+kHfZCZkgz8jMq99+hRlUbEshKQzEm6jY=",
  "U2FsdGVkX19JuhvqtlgqG1AdCxRl7I7BYLRS2IGNQwA=",
  "U2FsdGVkX1/Zk/mb7WjYBiTsK2aaH/UWQ0vKXzhRk8E=",
  "U2FsdGVkX1/mnxeVtMKBxjBvOBQCXHVCRMKu/vgGUug=",
  "U2FsdGVkX19a4XYZnXBVm9cO/iyFpYhZAdcK7+GuvYeRd4tOF3nzwhK8qitIEDFY",
  "U2FsdGVkX18xLdQg/QeIk9XNGVu9QiihXW1qWnSXRf8=",
  "U2FsdGVkX1/66eqmbnufuZ3lXKx/lg0SLcbqbBxWSnI=",
  "U2FsdGVkX19pEkAKKlKhJpMVI2oaKuH2Ar+F0UPGQGhkZ0ZJGkBBxON/cr/00iGF",
  "U2FsdGVkX193HabbrcWizOJ9BbzRNw2fqkGNPx+f7bc=",
  "U2FsdGVkX19jRYpuSOqEMzu1SIML8bYuMLYdD6yGcsY=",
  "U2FsdGVkX1/QG+953pJwcDA4BSZurF/4+l01UxWwh5Y=",
  "U2FsdGVkX1/mbc2JAkoP0bcrQmzf+xzSdNUuJJvDuwU=",
  "U2FsdGVkX1/Bhs6u8P2kD3a5rQihSl5tPir/NzXkoA8=",
  "U2FsdGVkX18wFJB/KEtdsEBejE+SEeCN65MAGEx/2gw=",
  "U2FsdGVkX19la0v91UkPe0cFPY5NhBCQNp3VjrF4giw=",
  "U2FsdGVkX1+13wEonHhUmXk2jO0Ypj3L7y5FZ2ykktEb22//+F2sjydQWZ9CI/d/",
  "U2FsdGVkX19ju/e9L2kcJSDbmo0tdXqjGOv/6vHk3Dg=",
  "U2FsdGVkX19QFmhGd0edZu6qtYfra0kthdP7Zi6482rx0g51bk8yiY90LOx4osft",
  "U2FsdGVkX18Na5/a7YYggh6vDlrT0uoJKq9kYMsY6o4=",
  "U2FsdGVkX1+BEQ2p+JyGwdTmFosBJvOa4pYgB+3SL9Q=",
  "U2FsdGVkX18897sLn9zF1gKyPov+8r1EDXD+NgCf7Ic=",
  "U2FsdGVkX1/hvvYqu6KZK4g6Kh/91nd/1flszliuNX8=",
  "U2FsdGVkX1/StcrOywwcipzZaPNfQ7lutxxVYlQgfXM=",
  "U2FsdGVkX1+otWfAaeFr3Jv6ieqkYrZbwiPYyj6UPvc=",
  "U2FsdGVkX1/oJXiWz2N9D6spduvuhXjRDoAFBbMuiko=",
  "U2FsdGVkX1/7TUNVoro42tVGRMGCKf1F1YN4gw7owuY=",
  "U2FsdGVkX1/Izw4kZVsk1j+0npBBD+eSIBFhzWhX0bfkJwszbLITYU97KmbBjPAe",
  "U2FsdGVkX18AuuvVtGvxR8Eu5SW3GQe1CKUkKSnXwXoCUSU8Qlx+NEFfGFLYAQIF",
  "U2FsdGVkX18ryrmSiJyPDj13854nvBTIyV0T9+2gKso=",
  "U2FsdGVkX18dJJG/7bXc/Vy1ETChl7Or8GP3Wkcddmk=",
  "U2FsdGVkX1/RS0hOcJhw6XXCgGn7gz7RI2aho60/MKo=",
  "U2FsdGVkX1/VJ4f99d6CLZjN2vkHCq1RQYw9sDEtA+w=",
  "U2FsdGVkX1/EtIBLz35KTMrYRu6FeFyTBlawhtPueXc=",
];
