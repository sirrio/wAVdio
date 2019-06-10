import {Component, Inject, LOCALE_ID, OnInit} from '@angular/core';
import {Exposition} from '../../../models/exposition';
import {ExpositionContent} from '../../../models/exposition-content';
import {ExpositionService} from '../../../services/exposition.service';
import {Router} from '@angular/router';
import {MuseumService} from '../../../services/museum.service';
import {Museum} from '../../../models/museum';
import {AuthenticationService} from '../../../services/authentification.service';

@Component({
  selector: 'app-new-admin-exposition-component',
  templateUrl: './new-admin-exposition.component.html',
  styleUrls: ['./new-admin-exposition.component.css']
})
export class NewAdminExpositionComponent implements OnInit {

  descHeader = 'Ausstellung anlegen';

  exposition: Exposition;
  museum: Museum;

  languages = ['de', 'en'];
  selectedLanguage = this.locale;

  alertType: number;
  alertMessage: string;
  showAlert: boolean;

  constructor(
    @Inject(LOCALE_ID) private locale: string,
    private museumService: MuseumService,
    private expositionService: ExpositionService,
    private router: Router,
    private auth: AuthenticationService) {
  }

  ngOnInit() {

    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/admin']);
    } else {
      this.museumService.getMuseums().subscribe(
        museums => {
          this.museum = museums[0];

          const englishContent = new ExpositionContent('en', 'Not available in your Language', '');
          const germanContent = new ExpositionContent('de', '', '');
          this.exposition = new Exposition(
            this.museum._id,
            true,
            0,
            '',
            null,
            [],
            [],
            [],
            [englishContent, germanContent]);
        }
      );
    }
  }

  createExposition() {
    if (!this.getExpositionContent(this.selectedLanguage).name) {
      this.showAlertMessage(3, 5, 'Das Titelfeld darf nicht leer sein. Bitte korrigieren Sie Ihre Eingabe.');
      return;
    }
    if (this.getExpositionContent(this.selectedLanguage).name.startsWith(' ')) {
      this.showAlertMessage(3, 5, 'Das Titelfeld darf keine vorangestellten Leerzeichen beinhalten. ' +
        'Bitte korrigieren Sie Ihre Eingabe.');
      return;
    }
    this.expositionService.createExposition(this.exposition).subscribe(
      exposition => {
        this.router.navigate(['admin/exposition/', exposition._id]);
        if (this.expositionService.errorCode === 500) {
          this.showAlertMessage(3, 5, 'Es ist ein Fehler aufgetreten. ' +
            'Mehr Informationen finden Sie in den Serverlogs.');
        } else {
          this.showAlertMessage(0, 5, 'Ihre Änderungen wurden erfolgreich übernommen');
        }
      }
    );
  }

  private showAlertMessage(type: number, seconds: number, message: string) {
    this.showAlert = true;
    this.alertType = type;
    this.alertMessage = message;
    setTimeout(() => this.showAlert = false, seconds * 1000);
  }

  getExpositionContent(locale: string) {
    for (const content of this.exposition.contents) {
      if (content.lang === locale) {
        return content;
      }
    }

    // not available ? must not happen. has to be created when constructing exposition
    console.error(`ExpositionContent missing for locale ${locale}`);
  }
}
