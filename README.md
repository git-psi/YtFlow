# YtFlow

## 🌟 Fonctionnalités

- Téléchargez de la musique et des vidéos.
- Interface conviviale avec un guide d'intégration.
- Intégration des playlists Spotify (l'accès à cette fonctionnalité doit être demandé).
- Mises à jour automatiques pour vous assurer d'avoir les dernières fonctionnalités.


## 🔧 Installation

> [!Note]
> YtFlow est disponible uniquement sur Windows et Linux, il n'y a actuellement pas de support pour Mac.

### Télécharger pour Windows :
- [Télécharger l'installateur](https://github.com/git-psi/YtFlow/releases/latest/download/YtFlow-Setup-windows.exe)

### Télécharger pour Linux :
Vous pouvez télécharger l'application dans les formats suivants :
- [AppImage](https://github.com/git-psi/YtFlow/releases/latest/download/YtFlow.AppImage) - Un format d'application portable.
- [Paquet Debian](https://github.com/git-psi/YtFlow/releases/latest/download/YtFlow.deb) - Pour les distributions basées sur Debian.

## ⚠️ Problèmes possibles
<details>
    <summary>
        Lors de son installation sur Windows, l'application est arrêtée par l'antivirus
    </summary>
    <blockquote>
        N'ayant pas de certificat, l'application peut être arrêtée par l'antivirus. Vous pouvez alors choisir de ne pas l'installer ou cliquer sur "More Info" puis "Run anyway".
        <br>
        <img src="https://github.com/git-psi/YtFlow/blob/main/img/screenshot-win-antivirus.png" alt="Screenshot Windows Antivirus" style="max-width:400px;">
    </blockquote>
</details>
<details>
    <summary>
        La fonctionnalité Spotify ne fonctionne pas
    </summary>
    <blockquote>
        À cause de restrictions imposées par Spotify, cette fonctionnalité ne peut pas être activée par défaut. 
        Pour l'activer, rien de plus simple : envoyez-moi l'adresse email du compte Spotify que vous souhaitez utiliser, à <a class='link-body-emphasis' href="mailto:perdu.felix@proton.me?subject=Activer%20l%27option%20pour%20mon%20compte%20Spotify&body=Pourrais-tu activer la fonctionnalité Spotify pour: [email].">perdu.felix@proton.me</a> (ou sur n'importe quelle plateforme).
    </blockquote>
</details>

## 🤝 Contribuer

Les contributions sont les bienvenues ! Si vous avez remarqué des bugs, des suggestions ou des améliorations, n'hésitez pas à ouvrir un [problème](https://github.com/git-psi/YtFlow/issues) ou à m'envoyer un mail à perdu.felix@proton.me.

## 🛠️ Outils Utilisés

Ce projet utilise plusieurs outils et bibliothèques pour fonctionner efficacement :

- [**Electron**](https://www.electronjs.org/)
- [**FFmpeg**](https://www.npmjs.com/package/fluent-ffmpeg)
- [**@distube/ytdl-core**](https://github.com/distubejs/ytdl-core)
- [**Bootstrap**](https://getbootstrap.com/)
- Et d'autres encores...

## 📜 Licence

Ce projet est sous licence MIT. Consultez le fichier [LICENSE](LICENSE) pour plus de détails.