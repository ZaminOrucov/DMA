const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');

// Menyu panelini açmaq və ya bağlamaq (Mobil və Desktop üçün)
menuToggle.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
        sidebar.classList.toggle('mobile-open');
    } else {
        sidebar.classList.toggle('collapsed');
    }
});

// Əsas menyuların alt başlıqlarını açmaq / bağlamaq
function toggleSubmenu(element) {
    const parentLi = element.parentElement;
    parentLi.classList.toggle('active');
}

// Menyu elementlərinə kliklədikdə sağ tərəfdəki məzmunu dinamik dəyişmək
function showContent(sectionId) {
    // 1. Bütün bölmələrdən 'active' klassını silirik (gizlədirik)
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // 2. Yalnız seçilən bölməyə 'active' klassı veririk (göstəririk)
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Mobil menyu açıqdısa bağlayırıq
    if (window.innerWidth <= 768 && typeof sidebar !== 'undefined') {
        sidebar.classList.remove('mobile-open');
    }
}
// Səhifə tam yüklənəndə yalnız "esas-sehife"ni aç, digərlərini gizlət
document.addEventListener("DOMContentLoaded", function () {
    showContent('esas-sehife');
});
/**
 * Əsas səhifədə rəhbər tərəfindən yeni qeyd əlavə etmək üçün funksiya
 */
function addNewNote() {
    const titleInput = document.getElementById('noteTitleInput');
    const descInput = document.getElementById('noteDescInput');
    const notesContainer = document.getElementById('notesContainer');

    const title = titleInput.value.trim();
    const desc = descInput.value.trim();

    if (!title || !desc) {
        alert("Zəhmət olmasa qeydin başlığını və mətnini daxil edin!");
        return;
    }

    // Cari tarixi almaq üçün
    const today = new Date();
    const dateStr = String(today.getDate()).padStart(2, '0') + '.' +
        String(today.getMonth() + 1).padStart(2, '0') + '.' +
        today.getFullYear();

    // Yeni qeyd elementi yaradılması
    const noteCard = document.createElement('div');
    noteCard.className = 'note-card';
    noteCard.innerHTML = `
        <div class="note-card-header">
            <h4>${escapeHtml(title)}</h4>
            <span class="note-date">${dateStr}</span>
        </div>
        <p>${escapeHtml(desc)}</p>
        <button class="btn-delete-note" onclick="this.parentElement.remove()"><i class="fa-solid fa-trash"></i></button>
    `;

    // Siyahının əvvəlinə əlavə edirik
    notesContainer.prepend(noteCard);

    // Formu təmizləyirik
    titleInput.value = '';
    descInput.value = '';
}

// Təhlükəsizlik üçün HTML simvollarını qorumaq köməkçisi
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function (m) { return map[m]; });
}
/**
 * TAB SEÇİMİ VƏ FİLTRLƏMƏ FUNKSİYASI
 * 
 * @param {HTMLElement} element - Kliklənən statistik kart
 * @param {string} tabType - Seçilən kateqoriya ('all', 'hoii', 'yarmarka', 'ebm')
 */
function selectEmpTab(element, tabType) {
    // 1. Bütün tab kartlarından active-tab klassını silirik
    const allTabs = document.querySelectorAll('.emp-card');
    allTabs.forEach(tab => tab.classList.remove('active-tab'));

    // 2. Kliklənən karta active-tab klassını veririk
    element.classList.add('active-tab');

    console.log(`[TAB DƏYİŞDİ]: Seçilən rejim -> ${tabType}`);

    // 3. Backend-dən yeni datanı çəkmək üçün funksiyanı çağırırıq
    fetchEmploymentData(tabType);
}

/**
 * BACKEND API İLƏ MƏLUMATLARIN İDARƏ EDİLMƏSİ (SQL INTERACTION)
 * 
 * [NOT FOR BACKEND]: Bu funksiya həm il/ay/rayon filtrləri dəyişdikdə, həm də ust tablar klikləndikdə çağırılır.
 */
function fetchEmploymentData(currentTab) {
    // Əgər parametr ötürülməyibsə, aktiv olan tab-ı tapırıq
    if (!currentTab) {
        const activeCard = document.querySelector('.emp-card.active-tab');
        currentTab = activeCard ? activeCard.getAttribute('data-tab') : 'all';
    }

    const year = document.getElementById('empYearFilter').value;
    const month = document.getElementById('empMonthFilter').value;
    const region = document.getElementById('empRegionFilter').value;

    console.log(`[BACKEND API SORĞUSU] -> Tab: ${currentTab}, İl: ${year}, Ay: ${month}, Rayon: ${region}`);

    /*
    // NÜMUNƏ BACKEND FETCH / AJAX SORĞUSU (C#, PHP, Node.js və s. üçün):
    fetch(`/api/employment/stats?type=${currentTab}&year=${year}&month=${month}&region=${region}`)
        .then(response => response.json())
        .then(data => {
            // SQL-dən gələn datalara uyğun qrafikləri dinamik yeniləyirik
            updateEmploymentCharts(data);
        })
        .catch(err => console.error("Data yüklənərkən xəta yarandı:", err));
    */
}

/**
 * SQL / API-dən gələn məlumatlarla DOM-un yenilənməsi üçün nümunə funksiya
 */
function updateEmploymentCharts(data) {
    // Nümunə: Naxçıvan üzrə qeydiyyat ünvanı sayını və Dövlət/Özəl bölgüsünü yeniləmək
    /*
    const naxcivanGroup = document.querySelector('#regAddressBarChart .single-bar-group[data-region="Naxçıvan"]');
    if (naxcivanGroup && data.regAddress.naxcivan) {
        naxcivanGroup.querySelector('.bar-val').innerText = data.regAddress.naxcivan.total;
        naxcivanGroup.setAttribute('data-dovlet', data.regAddress.naxcivan.dovlet);
        naxcivanGroup.setAttribute('data-ozel', data.regAddress.naxcivan.ozel);
        naxcivanGroup.querySelector('.bar-hover-popover span:nth-child(1)').innerText = data.regAddress.naxcivan.dovlet;
        naxcivanGroup.querySelector('.bar-hover-popover span:nth-child(2)').innerText = data.regAddress.naxcivan.ozel;
    }
    */
}
/**
 * PEŞƏ HAZIRLIĞI KURSLARI BÖLMƏSİ ÜÇÜN FİLTRLƏMƏ FUNKSİYASI
 * 
 * [NOT FOR BACKEND]: Rayon, Dövr və Peşə seçildikdə SQL-dən məlumat çəkmək üçün çağırılır.
 */
function fetchPeseData() {
    const region = document.getElementById('peseRegionFilter').value;
    const period = document.getElementById('pesePeriodFilter').value;
    const profession = document.getElementById('peseProfessionFilter').value;

    console.log(`[BACKEND API SORĞUSU - PEŞƏ KURSLARI] -> Rayon: ${region}, Dövr: ${period}, Peşə: ${profession}`);

    /*
    // BACKEND API AJAX / FETCH İNTEQRASİYASI NÜMUNƏSİ:
    fetch(`/api/pese-kurslari/stats?region=${region}&period=${period}&profession=${profession}`)
        .then(response => response.json())
        .then(data => {
            // SQL-dən gələn datalara uyğun dəyərləri ekranda yeniləyirik:
            document.getElementById('val-kurs-sayi').innerText = data.courseCount;
            document.getElementById('val-celb-olunan').innerText = data.enrolledCount;
            document.getElementById('val-bitiren').innerText = data.completedCount;
            document.getElementById('val-davam-eden').innerText = data.ongoingCount;
            document.getElementById('val-xaric-olunan').innerText = data.droppedCount;

            // Gender və Rayon üzrə qrafikləri yeniləmək üçün:
            // updatePeseCharts(data);
        })
        .catch(err => console.error("Peşə kursları məlumatı yüklənərkən xəta yarandı:", err));
    */
}
/**
 * VAKANSİYA BANKI BÖLMƏSİ ÜÇÜN FİLTRLƏMƏ FUNKSİYASI
 * 
 * [NOT FOR BACKEND]: İl, Ay və Rayon seçildikdə SQL-dən məlumat çəkmək üçün çağırılır.
 */
function fetchVacancyData() {
    const year = document.getElementById('vacYearFilter').value;
    const month = document.getElementById('vacMonthFilter').value;
    const region = document.getElementById('vacRegionFilter').value;

    console.log(`[BACKEND API SORĞUSU - VAKANSİYA BANKI] -> İl: ${year}, Ay: ${month}, Rayon: ${region}`);

    /*
    // BACKEND API AJAX / FETCH İNTEQRASİYASI NÜMUNƏSİ:
    fetch(`/api/vacancies/stats?year=${year}&month=${month}&region=${region}`)
        .then(response => response.json())
        .then(data => {
            // SQL-dən gələn dataya uyğun göstəriciləri yeniləyirik:
            document.getElementById('val-total-vac').innerText = data.totalVacancies;
            
            // Mülkiyyət növü
            document.getElementById('val-dovlet-txt').innerText = data.propertyType.dovlet;
            document.getElementById('lbl-dovlet').innerText = data.propertyType.dovlet;
            document.getElementById('val-qeyridovlet-txt').innerText = data.propertyType.qeyriDovlet;
            document.getElementById('lbl-qeyridovlet').innerText = data.propertyType.qeyriDovlet;

            // Qulluqçu / Fəhlə
            document.getElementById('val-qulluqcu-txt').innerText = data.category.qulluqcu;
            document.getElementById('lbl-qulluqcu').innerText = data.category.qulluqcu;
            document.getElementById('val-fehle-txt').innerText = data.category.fehle;
            document.getElementById('lbl-fehle').innerText = data.category.fehle;

            // Sütunlu qrafikləri yeniləmək üçün:
            // updateVacancyAddressChart(data.addressStats);
        })
        .catch(err => console.error("Vakansiya məlumatı yüklənərkən xəta yarandı:", err));
    */
}
/**
 * İŞSİZLİKDƏN SIĞORTA BÖLMƏSİ ÜÇÜN FİLTRLƏMƏ FUNKSİYASI
 * 
 * [NOT FOR BACKEND]: Rayon, Dövr və Status seçildikdə SQL-dən məlumat çəkmək üçün çağırılır.
 */
function fetchSigortaData() {
    const region = document.getElementById('sigRegionFilter').value;
    const period = document.getElementById('sigPeriodFilter').value;
    const status = document.getElementById('sigStatusFilter').value;

    console.log(`[BACKEND API SORĞUSU - İŞSİZLİKDƏN SIĞORTA] -> Rayon: ${region}, Dövr: ${period}, Status: ${status}`);

    /*
    // BACKEND API AJAX / FETCH İNTEQRASİYASI NÜMUNƏSİ:
    fetch(`/api/insurance/stats?region=${region}&period=${period}&status=${status}`)
        .then(response => response.json())
        .then(data => {
            // SQL-dən gələn datalara uyğun göstəriciləri yeniləyirik:
            document.getElementById('val-sig-muraciet').innerText = data.totalApplications;
            document.getElementById('val-sig-baxilan').innerText = data.reviewedCount;
            document.getElementById('val-sig-imtina').innerText = data.rejectedCount;
            document.getElementById('val-sig-teyinat').innerText = data.approvedCount;
            document.getElementById('val-sig-dayandirilan').innerText = data.suspendedCount;
            document.getElementById('val-sig-aktiv').innerText = data.activePaymentCount;

            // Gender faizlərini yeniləmək üçün:
            document.getElementById('val-sig-kisi-txt').innerText = data.gender.malePercent + '%';
            document.getElementById('val-sig-qadin-txt').innerText = data.gender.femalePercent + '%';

            // Rayonlar üzrə qrafiki yeniləmək üçün:
            // updateSigortaRegionChart(data.regionStats);
        })
        .catch(err => console.error("Sığorta məlumatı yüklənərkən xəta yarandı:", err));
    */
}
/**
 * PEŞƏYÖNÜMLÜ MƏSLƏHƏT XİDMƏTİ BÖLMƏSİ ÜÇÜN FİLTRLƏMƏ FUNKSİYASI
 * 
 * [NOT FOR BACKEND]: İl və Ay seçildikdə SQL-dən məlumat çəkmək üçün çağırılır.
 */
function fetchOrientationData() {
    const year = document.getElementById('orientYearFilter').value;
    const month = document.getElementById('orientMonthFilter').value;

    console.log(`[BACKEND API SORĞUSU - PEŞƏYÖNÜMLÜ MƏSLƏHƏT] -> İl: ${year}, Ay: ${month}`);

    /*
    // BACKEND API AJAX / FETCH İNTEQRASİYASI NÜMUNƏSİ:
    fetch(`/api/orientation/stats?year=${year}&month=${month}`)
        .then(response => response.json())
        .then(data => {
            // SQL-dən gələn datalara uyğun göstəriciləri yeniləyirik:
            document.getElementById('val-orient-total').innerText = data.totalParticipants;
            
            // Layihələrin saylarını yeniləmək üçün:
            document.getElementById('val-pese-naxcivan').innerText = data.projects.peseFestNaxcivan;
            document.getElementById('val-pese-ordubad').innerText = data.projects.peseFestOrdubad;
            document.getElementById('val-ixtisas-beledcisi').innerText = data.projects.ixtisasBeledcisi;
            document.getElementById('val-kendime-gel').innerText = data.projects.kendimeGel;

            // Rayonlar üzrə qrafiki yeniləmək üçün:
            // updateOrientationRegionChart(data.regionStats);
        })
        .catch(err => console.error("Peşəyönümlü məsləhət xidməti məlumatı yüklənərkən xəta yarandı:", err));
    */
}
/**
 * ƏMƏKHAQQININ BİRGƏ MALİYYƏLƏŞDİRİLMƏSİ BÖLMƏSİ ÜÇÜN FİLTRLƏMƏ FUNKSİYASI
 * 
 * [NOT FOR BACKEND]: Rayon, Dövr və Müəssisə seçildikdə SQL-dən məlumat çəkmək üçün çağırılır.
 */
function fetchMaliyeData() {
    const region = document.getElementById('malRegionFilter').value;
    const period = document.getElementById('malPeriodFilter').value;
    const company = document.getElementById('malCompanyFilter').value;

    console.log(`[BACKEND API SORĞUSU - BİRGƏ MALİYYƏLƏŞDİRMƏ] -> Rayon: ${region}, Dövr: ${period}, Müəssisə: ${company}`);

    /*
    // BACKEND API AJAX / FETCH İNTEQRASİYASI NÜMUNƏSİ:
    fetch(`/api/co-financing/stats?region=${region}&period=${period}&company=${company}`)
        .then(response => response.json())
        .then(data => {
            // SQL-dən gələn datalara uyğun göstəriciləri yeniləyirik:
            document.getElementById('val-mal-isletemin').innerText = data.employed;
            document.getElementById('val-mal-davam').innerText = data.ongoingPayment;
            document.getElementById('val-mal-dayanib').innerText = data.pausedPaymentWorking;
            document.getElementById('val-mal-cixan').innerText = data.leftWork;

            // Gender faiz və saylarını yeniləmək üçün:
            document.getElementById('val-mal-kisi-txt').innerText = data.gender.male;
            document.getElementById('lbl-mal-kisi').innerText = data.gender.male;
            document.getElementById('val-mal-qadin-txt').innerText = data.gender.female;
            document.getElementById('lbl-mal-qadin').innerText = data.gender.female;

            // Qrafikləri yeniləmək üçün:
            // updateMaliyeCharts(data);
        })
        .catch(err => console.error("Birgə maliyyələşdirmə məlumatı yüklənərkən xəta yarandı:", err));
    */
}
/**
 * ƏMƏK YARMARKASI BÖLMƏSİ ÜÇÜN FİLTRLƏMƏ FUNKSİYASI
 * 
 * [NOT FOR BACKEND]: Dövr və Yarmarka seçildikdə SQL-dən məlumat çəkmək üçün çağırılır.
 */
function fetchYarmarkaData() {
    const period = document.getElementById('yarPeriodFilter').value;
    const fair = document.getElementById('yarSelectFilter').value;

    console.log(`[BACKEND API SORĞUSU - ƏMƏK YARMARKASI] -> Dövr: ${period}, Yarmarka: ${fair}`);

    /*
    // BACKEND API AJAX / FETCH İNTEQRASİYASI NÜMUNƏSİ:
    fetch(`/api/job-fairs/stats?period=${period}&fair=${fair}`)
        .then(response => response.json())
        .then(data => {
            // SQL-dən gələn datalara uyğun üst kartları yeniləyirik:
            document.getElementById('val-yar-istirak').innerText = data.totalParticipants;
            document.getElementById('val-yar-muessise').innerText = data.totalCompanies;
            document.getElementById('val-yar-vakansiya').innerText = data.totalVacancies;
            document.getElementById('val-yar-temin').innerText = data.totalEmployed;

            // Qrafikləri yeniləmək üçün:
            // updateYarmarkaCharts(data);
        })
        .catch(err => console.error("Əmək yarmarkası məlumatı yüklənərkən xəta yarandı:", err));
    */
}
/**
 * HAQQI ÖDƏNİLƏN İCTİMAİ İŞLƏR BÖLMƏSİ ÜÇÜN FİLTRLƏMƏ FUNKSİYASI
 * 
 * [NOT FOR BACKEND]: İl, Ay və Rayon seçildikdə SQL-dən məlumat çəkmək üçün çağırılır.
 */
function fetchPublicWorksData() {
    const year = document.getElementById('pubYearFilter').value;
    const month = document.getElementById('pubMonthFilter').value;
    const region = document.getElementById('pubRegionFilter').value;

    console.log(`[BACKEND API SORĞUSU - İCTİMAİ İŞLƏR] -> İl: ${year}, Ay: ${month}, Rayon: ${region}`);

    /*
    // BACKEND API AJAX / FETCH İNTEQRASİYASI NÜMUNƏSİ:
    fetch(`/api/public-works/stats?year=${year}&month=${month}&region=${region}`)
        .then(response => response.json())
        .then(data => {
            // SQL-dən gələn datalara uyğun göstəriciləri yeniləyirik:
            document.getElementById('val-pub-kvota').innerText = data.quota;
            document.getElementById('val-pub-celb').innerText = data.totalEnrolled;
            document.getElementById('val-pub-aktiv').innerText = data.activeWorkers;
            document.getElementById('val-pub-xitam').innerText = data.terminated;
            document.getElementById('val-pub-vakant').innerText = data.vacantPlaces;

            // Xülasə siyahı və qrafikləri yeniləmək üçün:
            document.getElementById('sum-aktiv').innerText = data.activeWorkers;
            document.getElementById('sum-xitam').innerText = data.terminated;
            document.getElementById('sum-vakant').innerText = data.vacantPlaces;

            // Gender məlumatları:
            document.getElementById('lbl-pub-kisi').innerText = data.gender.male;
            document.getElementById('lbl-pub-qadin').innerText = data.gender.female;
        })
        .catch(err => console.error("İctimai işlər məlumatı yüklənərkən xəta yarandı:", err));
    */
}
/**
 * ÖZÜNÜMƏŞĞULLUQ PROQRAMI BÖLMƏSİ ÜÇÜN FİLTRLƏMƏ VƏ BACKEND / SQL İNTEQRASİYA FUNKSİYASI
 */
function loadOzunumesgulluqData() {
    const year = document.getElementById('ozunFilterYear').value;
    const month = document.getElementById('ozunFilterMonth').value;
    const region = document.getElementById('ozunFilterRegion').value;

    console.log(`[BACKEND API SORĞUSU - ÖZÜNÜMƏŞĞULLUQ] -> İl: ${year}, Ay: ${month}, Rayon: ${region}`);

    /*
    // BACKEND API FETCH İNTEQRASİYASI NÜMUNƏSİ:
    fetch(`/api/ozunumesgulluq/stats?year=${year}&month=${month}&region=${region}`)
        .then(response => response.json())
        .then(data => {
            // Üst statistik kartlardakı rəqəmləri SQL datalarına uyğun yeniləyirik:
            document.querySelector('.val-muraciet').innerText = data.totalApplications;
            document.querySelector('.val-kvota').innerText = data.quota;
            document.querySelector('.val-emlak').innerText = data.providedWithProperty;
            document.querySelector('.val-novbe').innerText = data.inQueueRegistry;
            document.querySelector('.val-kenar').innerText = data.excluded;

            // Cədvəli və qrafikləri yeniləmək üçün digər funksiyalar:
            // updateOzunumesgulluqTable(data.tableRows);
            // updateOzunumesgulluqCharts(data.charts);
        })
        .catch(err => console.error("Özünüməşğulluq məlumatları yüklənərkən xəta baş verdi:", err));
    */
}