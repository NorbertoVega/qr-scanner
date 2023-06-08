import { Injectable } from '@angular/core';
import { Registro } from '../models/registro.model';
import { Storage } from '@ionic/storage-angular';
import { NavController } from '@ionic/angular';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { EmailComposer } from '@awesome-cordova-plugins/email-composer/ngx';

@Injectable({
  providedIn: 'root'
})
export class DataLocalService {

  private _storage: Storage | null = null;
  guardados: Registro[] = [];
  private registrosKey = 'registros';

  constructor(private storage: Storage,
    private navCtrl: NavController,
    private inAppBrowser: InAppBrowser,
    private file: File,
    private emailComposer: EmailComposer) {
    this.init();
  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
    this.guardados = await this._storage.get(this.registrosKey) || [];
    console.log("Registros recuperados=", this.guardados);
  }

  async guardarRegistro(format: string, text: string) {
    await this.init();

    const nuevoRegistro = new Registro(format, text);
    this.guardados.unshift(nuevoRegistro);
    console.log('Guardados=', this.guardados);
    this._storage?.set(this.registrosKey, this.guardados);
    this.abrirRegistro(nuevoRegistro)
  }

  abrirRegistro(registro: Registro) {
    this.navCtrl.navigateForward('/tabs/tab2');
    switch (registro.type) {
      case 'http':
        // abrir el navegador web
        this.inAppBrowser.create(registro.text, '_system');
        break;
      case 'geo':
        // ir al pege tabs/tab2/mapa/geo/
        this.navCtrl.navigateForward(`/tabs/tab2/mapa/${registro.text}`);
        break;
    }
  }

  enviarCorreo() {
    const arrTemp = [];
    const titulos = 'Tipo, Formato, Creado en, Texto\n';

    arrTemp.push(titulos);
    this.guardados.forEach(registro => {
      const fila = `${registro.type}, ${registro.format}, ${registro.created}, ${registro.text.replace(',', ' ')}\n`;
      arrTemp.push(fila);
    });

    //console.log(arrTemp.join(""));
    this.crearArchivoFisico(arrTemp.join(''));
  }

  crearArchivoFisico(text: string) {
    this.file.checkFile(this.file.dataDirectory, 'registros.csv')
      .then(existe => {
        console.log('Existe=', existe);

        return this.escribirEnArchivo(text);
      })
      .catch(err => {
        console.log("Archivo no encontrado. Se crea registros.csv. Error:", err);

        return this.file.createFile(this.file.dataDirectory, 'registros.csv', false)
          .then(creado => this.escribirEnArchivo(text))
          .catch(err2 => console.log("No se pudo crear el archivo", err2)
          );
      });
  }

  async escribirEnArchivo(text: string) {
    await this.file.writeExistingFile(this.file.dataDirectory, 'registros.csv', text);
    console.log("Archivo creado");
    const archivo = `${this.file.dataDirectory}registros.csv`;

    console.log(this.file.dataDirectory + 'registros.csv');

    const email = {
      to: 'norberto.a.vega.test@gmail.com',
      //cc: 'erika@mustermann.de',
      //bcc: ['john@doe.com', 'jane@doe.com'],
      attachments: [ archivo ],
      subject: 'Backup de scans',
      body: 'Aquí tienen sus backups de los scans (archivo adjunto)- <strong>ScanApp</strong> ',
      isHtml: true
    };

    this.emailComposer.open(email)
      .then(() => console.log("Se abre app de mail."))
  }
}
