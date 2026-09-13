import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Zenith Software Hub database seed...');

  // 1. Clean existing records in reverse order
  await prisma.downloadLog.deleteMany();
  await prisma.savedItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.systemRequirement.deleteMany();
  await prisma.downloadFile.deleteMany();
  await prisma.screenshot.deleteMany();
  await prisma.softwareTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.softwareItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users
  const adminPasswordHash = await bcrypt.hash('AdminPassword123!', 10);
  const userPasswordHash = await bcrypt.hash('UserPassword123!', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Tahir Abbas',
      email: 'admin@zenithhub.com',
      password: adminPasswordHash,
      role: 'ADMIN',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    },
  });

  const demoUser = await prisma.user.create({
    data: {
      name: 'Devin Thorne',
      email: 'user@zenithhub.com',
      password: userPasswordHash,
      role: 'USER',
      image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    },
  });

  console.log('✅ Created users: Admin (admin@zenithhub.com), Demo User (user@zenithhub.com)');

  // 3. Create Categories
  const catGames = await prisma.category.create({
    data: {
      name: 'Computer Games',
      slug: 'computer-games',
      description: 'AAA titles, indie gems, RPGs, tactical simulators, and competitive action games for PC.',
      icon: 'Gamepad2',
      orderIndex: 1,
    },
  });

  const catSoftware = await prisma.category.create({
    data: {
      name: 'Computer Software',
      slug: 'computer-software',
      description: 'High-performance developer suites, creative powerhouses, system utilities, and productivity tools.',
      icon: 'Laptop',
      orderIndex: 2,
    },
  });

  const catMobileApps = await prisma.category.create({
    data: {
      name: 'Mobile Apps',
      slug: 'mobile-apps',
      description: 'Essential mobile productivity, cybersecurity, multimedia tools, and utility APKs.',
      icon: 'Smartphone',
      orderIndex: 3,
    },
  });

  const catMobileGames = await prisma.category.create({
    data: {
      name: 'Mobile Games',
      slug: 'mobile-games',
      description: 'Action-packed mobile experiences, immersive turn-based RPGs, and addictive strategy games.',
      icon: 'Swords',
      orderIndex: 4,
    },
  });

  // 4. Create Tags
  const tagList = [
    { name: 'Open Source', slug: 'open-source' },
    { name: 'Cyberpunk', slug: 'cyberpunk' },
    { name: 'RPG', slug: 'rpg' },
    { name: 'Strategy', slug: 'strategy' },
    { name: 'Developer Tools', slug: 'developer-tools' },
    { name: 'Productivity', slug: 'productivity' },
    { name: 'Video Editing', slug: 'video-editing' },
    { name: 'Graphic Design', slug: 'graphic-design' },
    { name: 'Security', slug: 'security' },
    { name: 'Offline Play', slug: 'offline-play' },
    { name: 'Ray Tracing', slug: 'ray-tracing' },
    { name: 'Cross Platform', slug: 'cross-platform' },
    { name: 'Low Spec Friendly', slug: 'low-spec-friendly' },
    { name: 'High Performance', slug: 'high-performance' },
  ];

  const tagMap = new Map<string, string>();
  for (const t of tagList) {
    const createdTag = await prisma.tag.create({ data: t });
    tagMap.set(t.slug, createdTag.id);
  }

  // 5. Seed Catalog Items
  // --- A. Computer Games ---
  const game1 = await prisma.softwareItem.create({
    data: {
      title: 'Neon Odyssey: 2088',
      slug: 'neon-odyssey-2088',
      tagline: 'Immersive open-world cyberpunk RPG with dynamic cybernetic enhancements and branching storylines.',
      description: 'Explore the sprawling megalopolis of Neo-Vegas. Master hacking, tactical weapon modification, and cyber-enhancement warfare in a world ruled by rogue megacorporations.',
      detailedDescription: `### Enter the Neon Grid

*Neon Odyssey: 2088* delivers an unparalleled cyberpunk action-RPG experience built on Next-Gen real-time ray tracing and procedural city systems.

#### Core Features
- **Dynamic Cyberware Overhauls**: Install over 180 modular cybernetic implants altering mobility, vision, and combat mechanics.
- **Deep Choice-Driven Narrative**: 14 distinct factions, over 85 story quests, and 6 diverse endings influenced by your decisions.
- **Vertical Megacity Exploration**: Scale skyscrapers, traverse subterranean data vaults, and commandeer anti-gravity hovercrafts.
- **Full Mod Support & Offline Singleplayer**: Built-in engine SDK for custom quests, textures, and community sound packs.`,
      developer: 'Vortex Interactive Studios',
      publisher: 'Zenith Quantum Media',
      releaseDate: new Date('2025-11-14'),
      version: '1.4.2',
      license: 'PAID',
      isFeatured: true,
      isTrending: true,
      isTopRated: true,
      downloadCount: 148200,
      viewCount: 412000,
      averageRating: 4.88,
      ratingCount: 3120,
      iconUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=256&auto=format&fit=crop&q=80',
      heroBannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
      categoryId: catGames.id,
      tags: {
        create: [
          { tagId: tagMap.get('cyberpunk')! },
          { tagId: tagMap.get('rpg')! },
          { tagId: tagMap.get('ray-tracing')! },
        ],
      },
      screenshots: {
        create: [
          { url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1000&auto=format&fit=crop&q=80', caption: 'Neo-Vegas Upper District at Night', orderIndex: 0 },
          { url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1000&auto=format&fit=crop&q=80', caption: 'Tactical Cyberware Combat Engine', orderIndex: 1 },
          { url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1000&auto=format&fit=crop&q=80', caption: 'Subway Data-Vault Breach Mission', orderIndex: 2 },
        ],
      },
      downloadFiles: {
        create: [
          {
            platform: 'WINDOWS',
            architecture: 'x64',
            version: '1.4.2',
            fileName: 'Neon_Odyssey_2088_v1.4.2_Setup.exe',
            fileSize: BigInt(48500000000), // ~48.5 GB
            formattedSize: '48.5 GB',
            fileHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            storageKey: 'games/neon-odyssey-2088/Neon_Odyssey_2088_v1.4.2_Setup.exe',
            downloadCount: 112000,
            isPrimary: true,
          },
          {
            platform: 'LINUX',
            architecture: 'x64',
            version: '1.4.2',
            fileName: 'Neon_Odyssey_2088_v1.4.2_Linux.tar.gz',
            fileSize: BigInt(49100000000),
            formattedSize: '49.1 GB',
            fileHash: 'f4b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b999',
            storageKey: 'games/neon-odyssey-2088/Neon_Odyssey_2088_v1.4.2_Linux.tar.gz',
            downloadCount: 36200,
            isPrimary: false,
          },
        ],
      },
      systemRequirements: {
        create: [
          {
            platform: 'WINDOWS',
            reqType: 'MINIMUM',
            os: 'Windows 10 / 11 64-bit',
            processor: 'Intel Core i5-8400 or AMD Ryzen 5 2600',
            memory: '16 GB RAM',
            graphics: 'NVIDIA GeForce GTX 1060 6GB or AMD Radeon RX 580',
            storage: '65 GB SSD available space',
            directX: 'Version 12',
            network: 'Broadband Internet connection for activation',
          },
          {
            platform: 'WINDOWS',
            reqType: 'RECOMMENDED',
            os: 'Windows 11 64-bit (Latest Build)',
            processor: 'Intel Core i7-12700K or AMD Ryzen 7 7800X3D',
            memory: '32 GB DDR5 RAM',
            graphics: 'NVIDIA GeForce RTX 4070 12GB or AMD Radeon RX 7800 XT',
            storage: '65 GB NVMe High-Speed SSD',
            directX: 'Version 12 Ultimate (DirectStorage Enabled)',
            network: 'Broadband Internet connection',
          },
        ],
      },
    },
  });

  const game2 = await prisma.softwareItem.create({
    data: {
      title: 'Stellar Dominion: Galactic Tactics',
      slug: 'stellar-dominion',
      tagline: 'Turn-based 4X space grand strategy with real-time tactical fleet battles and planetary terraforming.',
      description: 'Build a space empire from a single star system to a galaxy-spanning civilization. Research dark matter warp drives, construct megastructures, and lead massive armada conflicts.',
      developer: 'AstroForge Games',
      publisher: 'Hyperion Strategy',
      releaseDate: new Date('2025-08-20'),
      version: '2.1.0',
      license: 'FREEWARE',
      isFeatured: true,
      isTrending: true,
      isTopRated: false,
      downloadCount: 89400,
      viewCount: 230000,
      averageRating: 4.75,
      ratingCount: 1840,
      iconUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=256&auto=format&fit=crop&q=80',
      heroBannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
      categoryId: catGames.id,
      tags: {
        create: [
          { tagId: tagMap.get('strategy')! },
          { tagId: tagMap.get('cross-platform')! },
          { tagId: tagMap.get('offline-play')! },
        ],
      },
      screenshots: {
        create: [
          { url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1000&auto=format&fit=crop&q=80', caption: 'Galactic Empire Diplomatic Starmap', orderIndex: 0 },
          { url: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1000&auto=format&fit=crop&q=80', caption: 'Dyson Sphere Construction Phase', orderIndex: 1 },
        ],
      },
      downloadFiles: {
        create: [
          {
            platform: 'WINDOWS',
            architecture: 'x64',
            version: '2.1.0',
            fileName: 'Stellar_Dominion_Setup_v2.1.0.exe',
            fileSize: BigInt(8400000000), // 8.4 GB
            formattedSize: '8.4 GB',
            storageKey: 'games/stellar-dominion/Stellar_Dominion_Setup_v2.1.0.exe',
            downloadCount: 65000,
            isPrimary: true,
          },
          {
            platform: 'MACOS',
            architecture: 'universal',
            version: '2.1.0',
            fileName: 'Stellar_Dominion_v2.1.0_macOS.dmg',
            fileSize: BigInt(8600000000),
            formattedSize: '8.6 GB',
            storageKey: 'games/stellar-dominion/Stellar_Dominion_v2.1.0_macOS.dmg',
            downloadCount: 24400,
            isPrimary: false,
          },
        ],
      },
      systemRequirements: {
        create: [
          {
            platform: 'WINDOWS',
            reqType: 'MINIMUM',
            os: 'Windows 10 64-bit',
            processor: 'Intel Core i3-4160 or AMD FX-4350',
            memory: '8 GB RAM',
            graphics: 'GeForce GTX 460 or Radeon HD 6850',
            storage: '12 GB available space',
          },
        ],
      },
    },
  });

  const game3 = await prisma.softwareItem.create({
    data: {
      title: 'Aetheria: Chronicles of the Forgotten Realm',
      slug: 'aetheria-chronicles',
      tagline: 'High-fantasy isometric action RPG featuring reactive spellcrafting and procedurally generated dungeons.',
      description: 'Harness the elements to sculpt destructive spells. Journey across ancient ruins, confront primordial dragons, and uncover the forgotten origins of the celestial shard.',
      developer: 'RuneStone Interactive',
      releaseDate: new Date('2026-01-10'),
      version: '1.0.5',
      license: 'FREE',
      isFeatured: false,
      isTrending: true,
      isTopRated: true,
      downloadCount: 52100,
      viewCount: 145000,
      averageRating: 4.92,
      ratingCount: 1420,
      iconUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=256&auto=format&fit=crop&q=80',
      heroBannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
      categoryId: catGames.id,
      tags: {
        create: [
          { tagId: tagMap.get('rpg')! },
          { tagId: tagMap.get('low-spec-friendly')! },
        ],
      },
      downloadFiles: {
        create: [
          {
            platform: 'WINDOWS',
            architecture: 'x64',
            version: '1.0.5',
            fileName: 'Aetheria_Chronicles_Installer.exe',
            fileSize: BigInt(4200000000), // 4.2 GB
            formattedSize: '4.2 GB',
            storageKey: 'games/aetheria/Aetheria_Chronicles_Installer.exe',
            downloadCount: 52100,
            isPrimary: true,
          },
        ],
      },
    },
  });

  // --- B. Computer Software ---
  const soft1 = await prisma.softwareItem.create({
    data: {
      title: 'AuraStudio Pro: Neural Video Suite',
      slug: 'aurastudio-pro',
      tagline: 'GPU-accelerated non-linear video editor with real-time AI object isolation, scene synthesis, and color grading.',
      description: 'Engineered for video editors, content creators, and VFX artists. AuraStudio Pro accelerates 4K/8K rendering with native AV1 hardware support and AI-assisted motion tracking.',
      detailedDescription: `### The Next Generation of Video Production

AuraStudio Pro merges timeline agility with state-of-the-art neural media engines.

#### Professional Feature Set:
- **Neural Rotoscoping**: Segment subjects in 4K 60fps footage in seconds without tedious manual masks.
- **Universal Multi-Track Audio Engine**: 32-bit float audio editing with dynamic AI background de-noise.
- **Hardware Super-Resolution**: Native acceleration for NVIDIA NVENC/CUDA, AMD ROCm, and Apple Metal 3.
- **Collaborative Project Sync**: Offline-first local project storage with optional team asset sharing.`,
      developer: 'Aura Systems Inc.',
      publisher: 'Aura Creative Labs',
      releaseDate: new Date('2026-02-01'),
      version: '4.5.1',
      license: 'TRIAL',
      isFeatured: true,
      isTrending: true,
      isTopRated: true,
      downloadCount: 284000,
      viewCount: 650000,
      averageRating: 4.94,
      ratingCount: 5620,
      iconUrl: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=256&auto=format&fit=crop&q=80',
      heroBannerUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200&auto=format&fit=crop&q=80',
      categoryId: catSoftware.id,
      tags: {
        create: [
          { tagId: tagMap.get('video-editing')! },
          { tagId: tagMap.get('high-performance')! },
          { tagId: tagMap.get('cross-platform')! },
        ],
      },
      screenshots: {
        create: [
          { url: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=1000&auto=format&fit=crop&q=80', caption: 'Multi-cam Timeline with AI Auto-Sync', orderIndex: 0 },
          { url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000&auto=format&fit=crop&q=80', caption: 'Hardware Accelerated Color Grading Node Graph', orderIndex: 1 },
        ],
      },
      downloadFiles: {
        create: [
          {
            platform: 'WINDOWS',
            architecture: 'x64',
            version: '4.5.1',
            fileName: 'AuraStudio_Pro_4.5.1_Windows_x64.exe',
            fileSize: BigInt(840000000), // 840 MB
            formattedSize: '840 MB',
            storageKey: 'software/aurastudio/AuraStudio_Pro_4.5.1_Windows_x64.exe',
            downloadCount: 165000,
            isPrimary: true,
          },
          {
            platform: 'MACOS',
            architecture: 'arm64',
            version: '4.5.1',
            fileName: 'AuraStudio_Pro_4.5.1_AppleSilicon.dmg',
            fileSize: BigInt(780000000), // 780 MB
            formattedSize: '780 MB',
            storageKey: 'software/aurastudio/AuraStudio_Pro_4.5.1_AppleSilicon.dmg',
            downloadCount: 119000,
            isPrimary: false,
          },
        ],
      },
      systemRequirements: {
        create: [
          {
            platform: 'WINDOWS',
            reqType: 'MINIMUM',
            os: 'Windows 10 or 11 64-bit',
            processor: 'Intel Core i5 (10th gen) / AMD Ryzen 3000 series',
            memory: '16 GB RAM',
            graphics: '4 GB VRAM (GeForce GTX 1650 / Radeon RX 570)',
            storage: '4 GB fast SSD space',
          },
          {
            platform: 'WINDOWS',
            reqType: 'RECOMMENDED',
            os: 'Windows 11 64-bit',
            processor: 'Intel Core i7-14700K / AMD Ryzen 9 7900X',
            memory: '32 GB or 64 GB DDR5 RAM',
            graphics: 'NVIDIA RTX 4070 12GB / RTX 4080',
            storage: 'NVMe Gen4 SSD (10 GB+)',
          },
        ],
      },
    },
  });

  const soft2 = await prisma.softwareItem.create({
    data: {
      title: 'HyperCode IDE: Quantum Edition',
      slug: 'hypercode-ide',
      tagline: 'Blazing fast, Rust-powered code editor with local neural completions and instant terminal environments.',
      description: 'Zero bloat, sub-10ms startup times, and seamless containerized dev environments. HyperCode provides intelligent code refactoring, LSP support for 40+ languages, and embedded Git graph visualizer.',
      developer: 'HyperCode Foundation',
      releaseDate: new Date('2026-02-15'),
      version: '2.8.0',
      license: 'OPEN_SOURCE',
      isFeatured: true,
      isTrending: true,
      isTopRated: true,
      downloadCount: 420000,
      viewCount: 980000,
      averageRating: 4.96,
      ratingCount: 7800,
      iconUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=256&auto=format&fit=crop&q=80',
      heroBannerUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80',
      categoryId: catSoftware.id,
      tags: {
        create: [
          { tagId: tagMap.get('open-source')! },
          { tagId: tagMap.get('developer-tools')! },
          { tagId: tagMap.get('cross-platform')! },
          { tagId: tagMap.get('high-performance')! },
        ],
      },
      screenshots: {
        create: [
          { url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1000&auto=format&fit=crop&q=80', caption: 'Rust LSP Editor with Local AI Code Copilot', orderIndex: 0 },
        ],
      },
      downloadFiles: {
        create: [
          {
            platform: 'WINDOWS',
            architecture: 'x64',
            version: '2.8.0',
            fileName: 'HyperCode-Setup-2.8.0-x64.exe',
            fileSize: BigInt(68000000), // 68 MB
            formattedSize: '68 MB',
            storageKey: 'software/hypercode/HyperCode-Setup-2.8.0-x64.exe',
            downloadCount: 220000,
            isPrimary: true,
          },
          {
            platform: 'MACOS',
            architecture: 'universal',
            version: '2.8.0',
            fileName: 'HyperCode-2.8.0-Universal.dmg',
            fileSize: BigInt(72000000), // 72 MB
            formattedSize: '72 MB',
            storageKey: 'software/hypercode/HyperCode-2.8.0-Universal.dmg',
            downloadCount: 140000,
            isPrimary: false,
          },
          {
            platform: 'LINUX',
            architecture: 'x64',
            version: '2.8.0',
            fileName: 'hypercode_2.8.0_amd64.AppImage',
            fileSize: BigInt(65000000), // 65 MB
            formattedSize: '65 MB',
            storageKey: 'software/hypercode/hypercode_2.8.0_amd64.AppImage',
            downloadCount: 60000,
            isPrimary: false,
          },
        ],
      },
      systemRequirements: {
        create: [
          {
            platform: 'WINDOWS',
            reqType: 'MINIMUM',
            os: 'Windows 10 / 11, macOS 12+, Ubuntu 20.04+',
            processor: 'Any Dual-Core CPU',
            memory: '4 GB RAM',
            graphics: 'Integrated graphics',
            storage: '250 MB free space',
          },
        ],
      },
    },
  });

  const soft3 = await prisma.softwareItem.create({
    data: {
      title: 'CipherVault: Zero-Knowledge Password & Key Manager',
      slug: 'ciphervault',
      tagline: 'End-to-end encrypted password, SSH key, and identity manager with biometric lock and offline vault.',
      description: 'Protect your digital life with Argon2id hashing and AES-256-GCM encryption. Features password health audit, 2FA authenticator, breach monitor, and peer-to-peer encrypted sync.',
      developer: 'CipherVault Security Labs',
      releaseDate: new Date('2025-10-05'),
      version: '3.2.4',
      license: 'OPEN_SOURCE',
      isFeatured: false,
      isTrending: true,
      isTopRated: true,
      downloadCount: 310000,
      viewCount: 520000,
      averageRating: 4.91,
      ratingCount: 4210,
      iconUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=256&auto=format&fit=crop&q=80',
      categoryId: catSoftware.id,
      tags: {
        create: [
          { tagId: tagMap.get('open-source')! },
          { tagId: tagMap.get('security')! },
          { tagId: tagMap.get('cross-platform')! },
        ],
      },
      downloadFiles: {
        create: [
          {
            platform: 'WINDOWS',
            architecture: 'x64',
            version: '3.2.4',
            fileName: 'CipherVault_Setup_3.2.4.msi',
            fileSize: BigInt(45000000), // 45 MB
            formattedSize: '45 MB',
            storageKey: 'software/ciphervault/CipherVault_Setup_3.2.4.msi',
            downloadCount: 180000,
            isPrimary: true,
          },
          {
            platform: 'MACOS',
            architecture: 'universal',
            version: '3.2.4',
            fileName: 'CipherVault-3.2.4.dmg',
            fileSize: BigInt(48000000), // 48 MB
            formattedSize: '48 MB',
            storageKey: 'software/ciphervault/CipherVault-3.2.4.dmg',
            downloadCount: 130000,
            isPrimary: false,
          },
        ],
      },
    },
  });

  // --- C. Mobile Apps ---
  const mobApp1 = await prisma.softwareItem.create({
    data: {
      title: 'ZenTask: Mindful GTD Planner',
      slug: 'zentask-planner',
      tagline: 'Minimalist habit tracker, time-blocking planner, and markdown journal with offline SQLite sync.',
      description: 'Take back control of your schedule. ZenTask balances Pomodoro timers, recursive checklist nesting, and visual goal heatmaps with zero ads and complete data sovereignty.',
      developer: 'Mindcraft Software',
      releaseDate: new Date('2026-01-20'),
      version: '2.4.0',
      license: 'FREE',
      isFeatured: true,
      isTrending: true,
      isTopRated: true,
      downloadCount: 195000,
      viewCount: 420000,
      averageRating: 4.89,
      ratingCount: 3820,
      iconUrl: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=256&auto=format&fit=crop&q=80',
      heroBannerUrl: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=1200&auto=format&fit=crop&q=80',
      categoryId: catMobileApps.id,
      tags: {
        create: [
          { tagId: tagMap.get('productivity')! },
          { tagId: tagMap.get('offline-play')! },
        ],
      },
      screenshots: {
        create: [
          { url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1000&auto=format&fit=crop&q=80', caption: 'Daily Focus Mode and Time Blocking Matrix', orderIndex: 0 },
        ],
      },
      downloadFiles: {
        create: [
          {
            platform: 'ANDROID',
            architecture: 'apk',
            version: '2.4.0',
            fileName: 'ZenTask_v2.4.0_Official_Release.apk',
            fileSize: BigInt(28000000), // 28 MB
            formattedSize: '28 MB',
            storageKey: 'mobile-apps/zentask/ZenTask_v2.4.0_Official_Release.apk',
            downloadCount: 145000,
            isPrimary: true,
          },
          {
            platform: 'IOS',
            architecture: 'ipa',
            version: '2.4.0',
            fileName: 'ZenTask_v2.4.0_iOS.ipa',
            fileSize: BigInt(34000000), // 34 MB
            formattedSize: '34 MB',
            storageKey: 'mobile-apps/zentask/ZenTask_v2.4.0_iOS.ipa',
            downloadCount: 50000,
            isPrimary: false,
          },
        ],
      },
      systemRequirements: {
        create: [
          {
            platform: 'ANDROID',
            reqType: 'MINIMUM',
            os: 'Android 10.0 (API level 29) or higher',
            processor: 'ARM64 or x86_64',
            memory: '3 GB RAM',
            graphics: 'OpenGL ES 3.0',
            storage: '80 MB free space',
          },
        ],
      },
    },
  });

  const mobApp2 = await prisma.softwareItem.create({
    data: {
      title: 'SpectraCam: RAW Pro Mobile Camera',
      slug: 'spectracam-pro',
      tagline: 'Manual exposure photography, 10-bit HDR video recording, and custom LUT color profiles for mobile.',
      description: 'Unlock the full hardware sensor potential of your smartphone. Manual shutter speed, ISO wheel, focus peaking, histogram analysis, and lossless DNG RAW photo capture.',
      developer: 'OpticsLab Mobile',
      releaseDate: new Date('2025-12-05'),
      version: '1.9.8',
      license: 'FREEWARE',
      isFeatured: false,
      isTrending: true,
      isTopRated: true,
      downloadCount: 162000,
      viewCount: 310000,
      averageRating: 4.82,
      ratingCount: 2190,
      iconUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=256&auto=format&fit=crop&q=80',
      categoryId: catMobileApps.id,
      tags: {
        create: [
          { tagId: tagMap.get('graphic-design')! },
          { tagId: tagMap.get('high-performance')! },
        ],
      },
      downloadFiles: {
        create: [
          {
            platform: 'ANDROID',
            architecture: 'apk',
            version: '1.9.8',
            fileName: 'SpectraCam_Pro_v1.9.8.apk',
            fileSize: BigInt(52000000), // 52 MB
            formattedSize: '52 MB',
            storageKey: 'mobile-apps/spectracam/SpectraCam_Pro_v1.9.8.apk',
            downloadCount: 162000,
            isPrimary: true,
          },
        ],
      },
    },
  });

  // --- D. Mobile Games ---
  const mobGame1 = await prisma.softwareItem.create({
    data: {
      title: 'Shadowblade: Rebirth',
      slug: 'shadowblade-rebirth',
      tagline: 'High-octane side-scrolling ninja combat platformer with fluid parrying and atmospheric pixel art.',
      description: 'Dash through ancient temples, evade fatal spikes, and duel rival assassin clans. Features precision touch controls, 60fps/120fps display support, and zero pay-to-win mechanics.',
      developer: 'KuroNeko Interactive',
      releaseDate: new Date('2026-01-05'),
      version: '1.2.0',
      license: 'FREE',
      isFeatured: true,
      isTrending: true,
      isTopRated: true,
      downloadCount: 245000,
      viewCount: 540000,
      averageRating: 4.91,
      ratingCount: 4890,
      iconUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=256&auto=format&fit=crop&q=80',
      heroBannerUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop&q=80',
      categoryId: catMobileGames.id,
      tags: {
        create: [
          { tagId: tagMap.get('action') || tagMap.get('cyberpunk')! },
          { tagId: tagMap.get('offline-play')! },
        ],
      },
      screenshots: {
        create: [
          { url: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=1000&auto=format&fit=crop&q=80', caption: 'Midnight Rooftop Katana Boss Fight', orderIndex: 0 },
        ],
      },
      downloadFiles: {
        create: [
          {
            platform: 'ANDROID',
            architecture: 'apk',
            version: '1.2.0',
            fileName: 'Shadowblade_Rebirth_v1.2.0.apk',
            fileSize: BigInt(380000000), // 380 MB
            formattedSize: '380 MB',
            storageKey: 'mobile-games/shadowblade/Shadowblade_Rebirth_v1.2.0.apk',
            downloadCount: 185000,
            isPrimary: true,
          },
          {
            platform: 'IOS',
            architecture: 'ipa',
            version: '1.2.0',
            fileName: 'Shadowblade_Rebirth_v1.2.0.ipa',
            fileSize: BigInt(410000000), // 410 MB
            formattedSize: '410 MB',
            storageKey: 'mobile-games/shadowblade/Shadowblade_Rebirth_v1.2.0.ipa',
            downloadCount: 60000,
            isPrimary: false,
          },
        ],
      },
    },
  });

  const mobGame2 = await prisma.softwareItem.create({
    data: {
      title: 'Aegis Core: Tactical Defense',
      slug: 'aegis-core-defense',
      tagline: 'Futuristic sci-fi tower defense with customizable particle cannons, energy grids, and endless wave survival.',
      description: 'Deploy advanced planetary defense batteries. Route energy grid paths, overclock laser arrays, and repel relentless biomechanical alien swarms across 50 campaign sectors.',
      developer: 'Vanguard Games',
      releaseDate: new Date('2025-09-18'),
      version: '3.0.1',
      license: 'FREEWARE',
      isFeatured: false,
      isTrending: true,
      isTopRated: false,
      downloadCount: 118000,
      viewCount: 260000,
      averageRating: 4.79,
      ratingCount: 1940,
      iconUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=256&auto=format&fit=crop&q=80',
      categoryId: catMobileGames.id,
      tags: {
        create: [
          { tagId: tagMap.get('strategy')! },
          { tagId: tagMap.get('offline-play')! },
        ],
      },
      downloadFiles: {
        create: [
          {
            platform: 'ANDROID',
            architecture: 'apk',
            version: '3.0.1',
            fileName: 'AegisCore_v3.0.1.apk',
            fileSize: BigInt(210000000), // 210 MB
            formattedSize: '210 MB',
            storageKey: 'mobile-games/aegis-core/AegisCore_v3.0.1.apk',
            downloadCount: 118000,
            isPrimary: true,
          },
        ],
      },
    },
  });

  // 6. Create Reviews
  await prisma.review.create({
    data: {
      softwareId: game1.id,
      userId: demoUser.id,
      rating: 5,
      title: 'A masterpiece of atmospheric cyberpunk storytelling!',
      comment: 'The lighting on max settings is breathtaking. Cyberware combat feels punchy and rewarding. Downloaded through Zenith Hub and installed in minutes!',
      isVerifiedDownload: true,
      isApproved: true,
      helpfulVotes: 42,
    },
  });

  await prisma.review.create({
    data: {
      softwareId: soft2.id,
      userId: demoUser.id,
      rating: 5,
      title: 'Fastest editor I have ever touched',
      comment: 'Startup time is virtually instant compared to other IDEs. Memory consumption stays under 150MB even with 10 tabs open. Essential for any dev.',
      isVerifiedDownload: true,
      isApproved: true,
      helpfulVotes: 89,
    },
  });

  // 7. Create Demo User Saved Items (Wishlist) & Download Logs
  await prisma.savedItem.create({
    data: {
      userId: demoUser.id,
      softwareId: soft1.id,
    },
  });

  await prisma.savedItem.create({
    data: {
      userId: demoUser.id,
      softwareId: game2.id,
    },
  });

  const soft2File = await prisma.downloadFile.findFirst({
    where: { softwareId: soft2.id, platform: 'WINDOWS' },
  });

  if (soft2File) {
    await prisma.downloadLog.create({
      data: {
        userId: demoUser.id,
        softwareId: soft2.id,
        fileId: soft2File.id,
        platform: 'WINDOWS',
        status: 'COMPLETED',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    });
  }

  console.log('🎉 Zenith Software Hub database seeded successfully with rich realistic catalog data!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
