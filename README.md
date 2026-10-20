# FLORAA’S

Boutique e-commerce monolithique construite avec Laravel 13, PHP 8.3+, Inertia.js, React, TypeScript, Tailwind CSS 4 et Vite.

## Prérequis

- PHP 8.3 ou supérieur et les extensions Laravel nécessaires (PDO pour le moteur choisi, OpenSSL, Mbstring, Fileinfo, Ctype, JSON, Tokenizer, XML).
- Composer 2.
- Node.js 20.19+ ou 22.12+ et npm.
- MySQL/MariaDB pour un déploiement WAMP, ou SQLite pour un environnement local isolé.

Sur WAMP, vérifiez que `php` et `composer` en ligne de commande utilisent la version PHP souhaitée (`php -v`) et que l’extension PDO correspondante est activée.

## Installation locale

Depuis `C:\wamp64\www\floraas` :

```powershell
composer install
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
php artisan key:generate
```

Configurez ensuite `.env` avant de lancer les migrations.

### MySQL avec WAMP

Créez une base vide dans MySQL, puis indiquez les paramètres de connexion dans `.env` :

```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=floraas
DB_USERNAME=root
DB_PASSWORD=
```

Adaptez l’utilisateur et le mot de passe à votre installation. Ne remplacez pas `php artisan migrate` par `migrate:fresh` sur une base contenant des données : `migrate:fresh` supprime toutes les tables.

La migration Laravel des jobs limite à 120 caractères les colonnes du nouvel index composé de `failed_jobs`, pour rester sous la limite de 1000 octets rencontrée avec certains MySQL/MariaDB WAMP.

### SQLite (optionnel)

Pour un environnement local sans serveur MySQL :

```powershell
if (-not (Test-Path database\database.sqlite)) { New-Item -ItemType File -Path database\database.sqlite }
```

Puis configurez `DB_CONNECTION=sqlite` dans `.env`.

### Migrations et stockage

Une fois la base sélectionnée et créée :

```powershell
php artisan migrate
php artisan storage:link
npm ci
```

`php artisan migrate` applique uniquement les migrations en attente. Il ne supprime pas les données existantes. Les tests utilisent leur propre base SQLite en mémoire et ne nécessitent pas de réinitialiser la base WAMP.

### Lancer l’application

Dans deux terminaux depuis la racine du dépôt :

```powershell
php artisan serve
```

```powershell
npm.cmd run dev
```

Ouvrez l’URL indiquée par `php artisan serve` (par défaut `http://127.0.0.1:8000`). Pour construire les assets de production :

```powershell
npm.cmd run build
```

## Premier compte administrateur

Les inscriptions publiques créent uniquement des comptes clients. Après avoir exécuté les migrations, créez le premier administrateur avec :

```powershell
php artisan app:create-admin-user
```

La commande demande l’adresse e-mail, le nom et un mot de passe confirmé d’au moins 12 caractères. Le mot de passe est saisi de manière masquée. Ne fournissez pas de mot de passe via une commande enregistrée dans l’historique du terminal.

L’administration est accessible après connexion à `/admin`. Les routes sont protégées par authentification et rôle administrateur côté serveur.

## Catalogue de démonstration

La commande `php artisan db:seed` ne crée volontairement ni utilisateur de test ni catalogue artificiel.

Pour vérifier l’affichage avec des produits fictifs, exécutez explicitement :

```powershell
php artisan db:seed --class=DemoCatalogSeeder
```

Ce seeder crée des références préfixées `DÉMO`, dans la devise fictive `XXX`, avec stock nul. Il est idempotent et sert uniquement à la prévisualisation ; ne l’utilisez pas comme catalogue commercial ou en production.

## Fonctionnalités disponibles

- Boutique publique reliée aux produits, catégories, collections et variantes persistés.
- Recherche, tri, filtre de disponibilité et fiches produit.
- Référencement technique : métadonnées, données structurées de produit, `robots.txt` et sitemap XML dynamique.
- Administration des produits, images, catégorie, collection, publication, prix, variantes et stock.
- Gestion des catégories et collections, paramètres de la page d’accueil et annonce.
- Panier session dont les prix sont recalculés côté serveur.
- Demande de commande enregistrée avec instantané des noms, références, variantes, quantités, prix et devise.
- Espace admin de consultation des demandes avec transitions limitées à « client contacté » ou « annulée ».
- Compte client avec historique et détail des demandes transmises en étant connecté, isolés par utilisateur.

Les demandes restent explicitement non confirmées ; le statut de paiement reste `not_started`. Aucun paiement ni frais de livraison ne sont simulés. Le stock n’est pas réservé ou décrémenté lors d’une simple demande.

## Paramètres commerciaux à fournir

Avant d’ouvrir un véritable parcours de vente, le responsable de la boutique doit fournir et valider :

- Pays de vente, devise ISO 4217, coordonnées commerciales et informations légales.
- Tarifs, zones, délais et transporteurs de livraison.
- Prestataire de paiement et identifiants secrets fournis via l’environnement de production.
- Configuration SMTP pour les courriels transactionnels (le mailer par défaut journalise les messages en local).
- Textes, logo, photographie et données produits autorisés pour publication.

Ne configurez pas un paiement réel avant d’avoir implémenté et testé la vérification des retours/webhooks du prestataire, les règles de réservation et de décrément de stock, ainsi que les transitions de commande correspondantes.

## Tests et contrôles

```powershell
php artisan route:list --except-vendor
vendor\bin\pint --test
php artisan test --compact
npm.cmd run typecheck
npm.cmd run build
```

PHPUnit est configuré pour SQLite en mémoire (`phpunit.xml`). Les suites fonctionnelles peuvent donc migrer leur base isolée sans toucher à la base commerciale.

## Déploiement et exploitation

Le déploiement doit fournir PHP/Composer et Node/npm compatibles, une base sauvegardée, les variables d’environnement via le gestionnaire de secrets de l’hébergeur, et un stockage persistant pour les fichiers publics. Une procédure de production doit au minimum :

1. Installer les dépendances PHP sans les outils de développement (`composer install --no-dev --optimize-autoloader`).
2. Installer/construire les assets lors du build (`npm ci`, `npm run build`).
3. Déployer les fichiers et variables d’environnement, puis exécuter `php artisan migrate --force`.
4. Créer le lien de stockage si l’hébergeur ne le gère pas automatiquement (`php artisan storage:link`).
5. Exécuter `php artisan optimize` et configurer un scheduler/worker si des tâches ou files sont activés.
6. Vérifier `/up`, les journaux, les sauvegardes/restaurations et les permissions du stockage.

Ne versionnez jamais `.env`, clés API, mots de passe ou sauvegardes contenant des données personnelles. Aucun fournisseur de paiement, de livraison ou d’hébergement n’est imposé par le dépôt.
