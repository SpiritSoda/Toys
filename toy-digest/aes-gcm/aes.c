#include "aes.h"
#include <stdio.h>

byte byte_at(const unsigned char* bytes, unsigned int index) {
    return bytes[index];
}

void set_byte_at(unsigned char* bytes, unsigned int index, byte value) {
    bytes[index] = value;
}

aes_t allocate(int size) {
    aes_t mem = malloc(size * sizeof(byte));
    memset(mem, 0, sizeof(mem));
    return mem;
}

void deallocate(aes_t buf) {
    free(buf);
}

void copy(aes_t to, const aes_t from, int size) {
    memcpy(to, from, size);
}

aes_config_t UseAlgorithm(aes_alg_t alg) {
    aes_config_t aes_config;
    if(alg == AES_128) {
        aes_config.group_length = AES_GROUP_LENGTH;
        aes_config.key_length = AES_128_KEY_LENGTH;
        aes_config.nr = AES_128_ITER_NR;
    } else if(alg == AES_192) {
        aes_config.group_length = AES_GROUP_LENGTH;
        aes_config.key_length = AES_192_KEY_LENGTH;
        aes_config.nr = AES_192_ITER_NR;
    } else if(alg == AES_256) {
        aes_config.group_length = AES_GROUP_LENGTH;
        aes_config.key_length = AES_256_KEY_LENGTH;
        aes_config.nr = AES_256_ITER_NR;
    }
    return aes_config;
}

aes_t SubBytes(aes_t group) {
    for(unsigned int i = 0; i < AES_GROUP_LENGTH; i ++) {
        SET_BYTE_AES(group, i, sbox[(unsigned int)BYTE_AT_AES(group, i)]);
    }
    return group;
}

aes_t iSubBytes(aes_t group) {
    for(unsigned int i = 0; i < AES_GROUP_LENGTH; i ++) {
        SET_BYTE_AES(group, i, contrary_sbox[(unsigned int)BYTE_AT_AES(group, i)]);
    }
    return group;
}

aes_t ShiftRows(aes_t group) {
    for(int i = 1; i < 4; i ++) {
        aes_t head = group + (4 * i);
        unsigned int value = *(unsigned int*) head;
        *(unsigned int*)head = (value >> (8 * i)) | (value << (32 - 8 * i));
    }
    return group;
}

aes_t iShiftRows(aes_t group) {
    for(int i = 1; i < 4; i ++) {
        aes_t head = group + (4 * i);
        unsigned int value = *(unsigned int*) head;
        *(unsigned int*)head = (value << (8 * i)) | (value >> (32 - 8 * i));
    }
    return group;
    
}

aes_t MixColumns(aes_t group) {
    aes_t buf = ALLOCATE(4);

    for(int c = 0; c < 4; c ++) {
        SET_BYTE_AES(buf, 0, x2(matrix44ij(group, 0, c)) ^ x3(matrix44ij(group, 1, c)) ^ x1(matrix44ij(group, 2, c)) ^ x1(matrix44ij(group, 3, c)));
        SET_BYTE_AES(buf, 1, x1(matrix44ij(group, 0, c)) ^ x2(matrix44ij(group, 1, c)) ^ x3(matrix44ij(group, 2, c)) ^ x1(matrix44ij(group, 3, c)));
        SET_BYTE_AES(buf, 2, x1(matrix44ij(group, 0, c)) ^ x1(matrix44ij(group, 1, c)) ^ x2(matrix44ij(group, 2, c)) ^ x3(matrix44ij(group, 3, c)));
        SET_BYTE_AES(buf, 3, x3(matrix44ij(group, 0, c)) ^ x1(matrix44ij(group, 1, c)) ^ x1(matrix44ij(group, 2, c)) ^ x2(matrix44ij(group, 3, c)));
        
        SET_BYTE_AES(group, c, BYTE_AT_AES(buf, 0));
        SET_BYTE_AES(group, 4 + c, BYTE_AT_AES(buf, 1));
        SET_BYTE_AES(group, 8 + c, BYTE_AT_AES(buf, 2));
        SET_BYTE_AES(group, 12 + c, BYTE_AT_AES(buf, 3));
    }

    DEALLOCATE(buf);
    return group;
}

aes_t iMixColumns(aes_t group) {
    aes_t buf = ALLOCATE(4);

    for(int c = 0; c < 4; c ++) {
        SET_BYTE_AES(buf, 0, xe(matrix44ij(group, 0, c)) ^ xb(matrix44ij(group, 1, c)) ^ xd(matrix44ij(group, 2, c)) ^ x9(matrix44ij(group, 3, c)));
        SET_BYTE_AES(buf, 1, x9(matrix44ij(group, 0, c)) ^ xe(matrix44ij(group, 1, c)) ^ xb(matrix44ij(group, 2, c)) ^ xd(matrix44ij(group, 3, c)));
        SET_BYTE_AES(buf, 2, xd(matrix44ij(group, 0, c)) ^ x9(matrix44ij(group, 1, c)) ^ xe(matrix44ij(group, 2, c)) ^ xb(matrix44ij(group, 3, c)));
        SET_BYTE_AES(buf, 3, xb(matrix44ij(group, 0, c)) ^ xd(matrix44ij(group, 1, c)) ^ x9(matrix44ij(group, 2, c)) ^ xe(matrix44ij(group, 3, c)));

        SET_BYTE_AES(group, c, BYTE_AT_AES(buf, 0));
        SET_BYTE_AES(group, 4 + c, BYTE_AT_AES(buf, 1));
        SET_BYTE_AES(group, 8 + c, BYTE_AT_AES(buf, 2));
        SET_BYTE_AES(group, 12 + c, BYTE_AT_AES(buf, 3));
    }

    DEALLOCATE(buf);
    return group;
}

aes_t AddRoundKey(aes_t group, aes_t key, int round) {
    for(int i = 0; i < 16; i ++) {
        SET_BYTE_AES(group, i, BYTE_AT_AES(group, i) ^ BYTE_AT_AES(key, (round << 4) + i));
    }
    return group;
}

void ExpandKey(const aes_t seed, aes_t* out, aes_config_t aes_config) {
    int nr = aes_config.nr;
    int keylen = aes_config.key_length >> 3;
    int expandwords = 4 * (nr + 1);
    int expandlen = 4 * expandwords;
    byte buf[4];
    if(!out)
        return;
    if(!(*out))
        *out = ALLOCATE(expandlen);
    aes_t expanded = *out;
    for(int i = 0; i < keylen; ++i) {
        expanded[i] = seed[i];
    }
    int i = keylen >> 2;
    while(i < expandwords) {
        for(int j = 0; j < 4; j ++) {
            buf[j] = expanded[4 * (i - 1) + j];
        }
        if(i % 4 == 0) {
            byte t = buf[0];
            buf[0] = buf[1];
            buf[1] = buf[2];
            buf[2] = buf[3];
            buf[3] = t;

            buf[0] = sbox[buf[0]];
            buf[1] = sbox[buf[1]];
            buf[2] = sbox[buf[2]];
            buf[3] = sbox[buf[3]];

            buf[0] ^= RC[i / 4];
        }
        for(int j = 0; j < 4; j ++) {
            expanded[4 * i + j] = expanded[4 * (i - 4) + j] ^ buf[j];
        }
        ++i;
    }
}

void aes_encrypt_group(aes_t in, aes_t expandkey, aes_config_t aes_config) {
    AddRoundKey(in, expandkey, 0);
    for(int round = 1; round < aes_config.nr; round++) {
        SubBytes(in);
        ShiftRows(in);
        MixColumns(in);
        AddRoundKey(in, expandkey, round);
    }
    SubBytes(in);
    ShiftRows(in);
    AddRoundKey(in, expandkey, aes_config.nr);
}

void aes_decrypt_group(aes_t in, aes_t expandkey, aes_config_t aes_config) {
    AddRoundKey(in, expandkey, aes_config.nr);
    iShiftRows(in);
    iSubBytes(in);
    for(int round = aes_config.nr - 1; round > 0; round--) {
        AddRoundKey(in, expandkey, round);
        iMixColumns(in);
        iShiftRows(in);
        iSubBytes(in);
    }
    AddRoundKey(in, expandkey, 0);
}

aes_t AESEncrypt(aes_t in, int datalen, aes_t key, int* paddinglen, aes_config_t aes_config) {
    aes_t expandkey = NULL;
    ExpandKey(key, &expandkey, aes_config);
    *paddinglen = (1 + datalen / AES_GROUP_LENGTH) * AES_GROUP_LENGTH;
    aes_t encrypted = ALLOCATE(*paddinglen);
    COPY(encrypted, in, datalen);
    byte fullfilled = *paddinglen - datalen;
    for(int i = datalen; i < *paddinglen; i ++)
        SET_BYTE_AES(encrypted, i, fullfilled);
    for(int offset = 0; offset < *paddinglen; offset += AES_GROUP_LENGTH) {
        aes_encrypt_group(encrypted + offset, expandkey, aes_config);
    }
    return encrypted;
}

aes_t AESDecrypt(aes_t in, int paddinglen, aes_t key, int* datalen, aes_config_t aes_config) {
    aes_t expandkey = NULL;
    ExpandKey(key, &expandkey, aes_config);
    aes_t decrypted = ALLOCATE(paddinglen);
    COPY(decrypted, in, paddinglen);
    int round = 0;
    for(int offset = 0; offset < paddinglen; offset += AES_GROUP_LENGTH) {
        aes_decrypt_group(decrypted + offset, expandkey, aes_config);
    }
    int fullfilled = BYTE_AT_AES(decrypted, paddinglen - 1);
    *datalen = paddinglen - fullfilled;
    decrypted[*datalen] = 0;
    return decrypted;
}