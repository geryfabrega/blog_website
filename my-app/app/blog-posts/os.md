---
title: "kernal Journey Part 1"
date: "2025-11-19"
excerpt: "The Start of a very long divine comedy..."
---

![A Well Scripted Live Divine Comedy](/blog-images/journey.png)

# Why Build an Operating System?

Recently I have started a deep dive journey to learn systems programming, this is a field I'll admit has been very imtimidating to get into, it has always appeared to me as a sign of excellence or a final frontier to conquer in the world of software engineering. I have always been employed within the *application layer*, making full stack web apps or some services to achieve some business need, which so far has been an excellent career. However I have found my self critically lacking in systems/ OS knowledge. To mitigate this I took the time to read *Operating Systems Three Easy Pieces* by *Remzi & Andrea Arpaci-Dusseau*. This was an excellent read however I was left with many questions on how OS concepts are implemented. How can we write C code to actually create virtual memory? What does a sys call look like when implemented from scratch? What better way than to build a very minimal OS!

## The initial journey

Building an OS is no joke, a journey that may take months to years to achieve, a project like this can be largely open ended; due to this I will set short term goals depending on my progress. For now these goals are.

- **Boot the kernal**
- **Basic Graphics and text output**
- **Implement Paging**
- **Implement a Physical Memory Manager**
- **Implement a Simple kernal Heap**

Part 1 of this series will document how I created a minimally bootable kernal that can print text to the screen

## Creating a minimally bootable kernal

All code can be found in on [github](https://github.com/geryfabrega/my_os)
p.s. I largely used [this](https://wiki.osdev.org/Limine_Bare_Bones) tutorial from OSdev.org to assist with booting into my kernal.

### The Boot Environment

Before any operating system code runs, modern x86_64 machines execute firmware stored in non-volatile flash on the motherboard. This firmware is typically UEFI. Its responsibilities include initializing the CPU, training memory, initializing basic hardware, and providing a standardized boot environment.

UEFI does not load the kernel directly. Instead, it loads a bootloader as a UEFI application. In this project, that bootloader is Limine (As linked above from Osdev.org).

Limine runs inside the UEFI environment and uses UEFI boot services to load the kernel from disk, construct initial page tables, map the kernel into the higher half address space, and establish a temporary execution context. Once this setup is complete, Limine transfers control to the kernel and permanently exits.

From the kernel’s perspective, UEFI and Limine no longer exist — only the data structures Limine left behind remain.

![UEFI boot process diagram](/blog-images/UEFI_boot_process.png)

Source: [Wikimedia Commons - UEFI boot process](https://commons.wikimedia.org/wiki/File:UEFI_boot_process.png) (CC BY-SA 4.0, by Amila Ruwan 20)

## Hello World: ELF Load and Framebuffer Output

After the boot chain is setup, Limine loads my kernel ELF (`bin/myos`) and transfers execution to `kmain()`.

This was the first true milestone for me: take a font blob embedded in the kernel image, decode glyph bytes, and draw characters directly into the linear framebuffer.

![Hello world output from kernel framebuffer text draw](/blog-images/hello_world_output.png)

For text rendering, I also loaded a blob from my OS by piggy-backing on an already existing Unix console font format: **PSF** (`.psf`, PC Screen Font). Instead of inventing a custom glyph format, I reused that existing PSF font blob, linked it into the kernel image, and read it through linker symbols (`_binary_font_psf_start` / `_binary_font_psf_end`).

## Glyph Lookup from Imported Header + Offset

This is the exact part where I read the imported PSF header from `_binary_font_psf_start`, validate it, and compute where glyph bytes begin:

```c
const uint8_t *base = _binary_font_psf_start;
PSF1_Header *header = (PSF1_Header *)base;

if (header->magic != PSF1_FONT_MAGIC) {
    return;
}

uint32_t ng = (header->fontMode & 1u) ? 512u : 256u;
F.width = 8u;
F.height = header->characterSize;
F.numglyph = ng;
F.bytes_per_glyph = header->characterSize;
F.glyphs = base + sizeof(*header);
```

After that, glyph addressing is computed by index + byte offset:

```c
static inline uint32_t psf1_index_ascii(const PSF1_Font *F, unsigned char ch){
    return (uint32_t)ch % F->numglyph;
}

static inline const uint8_t *psf1_glyph_ptr(const PSF1_Font *F, uint32_t idx){
    return F->glyphs + (uint64_t)idx * (uint64_t)F->bytes_per_glyph;
}

uint32_t idx = psf1_index_ascii(&F, c);
const uint8_t *glyph = psf1_glyph_ptr(&F, idx);
```

The header/types this is based on are defined in my `font.h`:

```c
#define PSF1_FONT_MAGIC 0x0436

typedef struct {
    uint16_t magic; // Magic bytes for identification.
    uint8_t fontMode; // PSF font mode.
    uint8_t characterSize; // PSF character size.
} PSF1_Header;
```

The conversion/linking step can be seen in my readme.md. I converted the font blob into an object file, inspected symbols, then linked that `.o` into the kernel build:

```sh
objcopy -O elf64-x86-64 -B i386 -I binary font.psf font.o
readelf -s font.o
```

That output `font.o` is then included in the link process so symbols like `_binary_font_psf_start` are available inside kernel C code.

The basic rendering path is:

1. Read PSF font bytes from embedded binary symbols (`_binary_font_psf_start` / `_binary_font_psf_end`).
2. Parse the font header and locate the glyph bitmap for each character.
3. Iterate each glyph row/bit.
4. Write 32-bit pixels directly to framebuffer memory using framebuffer address + pitch.

![Linear framebuffer write visualization](/blog-images/linear_frame_buffer.png)

The row/column addressing starts with direct framebuffer indexing. This is one of the early helper writes I used:

```c
void printRC(int r,int c){
    struct limine_framebuffer *framebuffer = framebuffer_request.response->framebuffers[0];
    volatile uint32_t *fb_ptr = framebuffer->address;
    fb_ptr[r * (framebuffer->pitch / 4) + c] = 0xffffff;
}
```

In the full glyph path, each row/bit is translated into a pixel write. Foreground/background color is applied per bit:

```c
for (uint32_t row = 0; row < F.height; ++row) {
    uint8_t bits = glyph[row];
    uint8_t *dst_row =
        fb_base +
        (uint64_t)(py + (int)row) * framebuffer->pitch +
        (uint64_t)px * 4;

    for (uint32_t x = 0; x < 8; ++x) {
        uint8_t on = (uint8_t)((bits >> (7u - x)) & 1u);
        uint32_t *dst_px = (uint32_t *)(dst_row + x * 4);
        *dst_px = on ? fg : bg;
    }
}
```

For my text draws in `kmain()`, I used white-on-black (`0xffffff` / `0x000000`), but this can also be represented as `0xffffffff` in 32-bit formats depending on channel layout.

This is where my kernel "hello world" came from: a loaded PSF font blob from my OS assets rendered directly through linear framebuffer writes. No terminal, no userspace, no libc print, just direct pixel writes from kernal space.

## Debugging the Draw Path with QEMU + GDB

To verify this path, I booted the ISO in QEMU and attached GDB.

I launched QEMU with debug flags so it exposes a gdb server and pauses at startup:

- `-s` starts the gdb server on `tcp::1234`
- `-S` stops CPU execution immediately so we can attach first

![Setting Breakpoint at kernal entry](/blog-images/set_break_point.png)

Then in gdb I:

1. Connected to QEMU (`target remote :1234`)
2. Set a breakpoint on `kmain()`
3. Continued to the breakpoint
4. Stepped through instruction by instruction (`step` / `next` / `stepi`)

That step-through confirmed our loaded font data and framebuffer writes were doing what they needed to do, and we could watch text being written to screen from kernel code.

This concludes the hello-world and thus begins the long journey.