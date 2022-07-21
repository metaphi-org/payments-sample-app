

<template>
  <div>
    <h3>Thank you, we received your payment.</h3>
    <br />
    <p v-if="paymentResponse.id">
      <b>Payment id:</b> {{ paymentResponse.id }}
      <br />
      <b>Payment status:</b> {{ paymentResponse.status }}
      <br /> 
      <b> Other information: </b> {{ paymentResponse.metaphiResponse }}
    </p>
    <div v-if="polling" class="text-center">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
      <br /><br />
      <!-- <v-btn depressed small @click.prevent="stopPolling()">
        Stop polling
      </v-btn> -->
    </div>
    <div v-else class="text-center mt-8">
      <v-btn depressed small @click.prevent="newPayment()">
        Make a new payment
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'
import { mapGetters } from 'vuex'
import axios from 'axios'; 
import { MetaphiBankDetails } from '~/lib/paymentsApi';
const instance = axios.create({
  baseURL: 'http://localhost:8080'
})


@Component({
  computed: {
    ...mapGetters({
      isMarketplace: 'isMarketplace',
    }),
  },
})
export default class PaymentStatus extends Vue {
  @Prop({ type: String , default: '' })
  paymentId!: string
  metaphiBankDetails!: MetaphiBankDetails;
  paymentResponse = {
    id: '',
    status: '',
    metaphiResponse: ''
  }

  polling: boolean = false
  pollingId: number = 0
  isMarketplace!: boolean

  stopPolling() {
    clearInterval(this.pollingId)
    this.polling = false
    this.$emit('finished')
  }

  pollForPaymentsDetail(id: string) {
    this.polling = true
    this.pollingId = window.setInterval(() => {
      this.getPayment(id)
    }, 3000)
  }

  newPayment() {
    this.$emit('makeNewPayment')
  }

  async getPayment(paymentId: string) {
    try {
      let payment
      let metaphiResponse; 
      if (this.isMarketplace) {
        payment = await this.$marketplaceApi.getPaymentById(paymentId)
      } else {
        payment = await this.$paymentsApi.getPaymentById(paymentId);


        if(payment.status === 'confirmed'){


           //Call API on metaphi backend. 
           metaphiResponse =  JSON.stringify((await instance.post('/v1/onramp/' + paymentId, {
        'idempotencyKey': '6ae62bf2-bd71-49ce-a599-165ffcc33680',
        'beneficiaryName': 'John Smith',
        'accountNumber': '123456789',
        'routingNumber': '021000021',
        'billingDetails': {
            'name': 'John Smith',
            'city': 'Boston',
            'country': 'US',
            'line1': '1 Main Street',
            'district': 'MA',
            'postalCode': '02201'
        },
        'bankAddress': {
            'country': 'US'
        }
    }  )).data) ;  
        }

      }

      if (payment.status === 'confirmed' || payment.status === 'failed') {
    
        this.stopPolling()
      }
      this.paymentResponse = payment
      this.paymentResponse.metaphiResponse = metaphiResponse? metaphiResponse : 'none'; 
    } catch (error) {
      this.stopPolling()
      this.$emit('error', error)
    }
  }

  mounted() {
    if (this.paymentId) {
      // alert(this.paymentId);
      this.pollForPaymentsDetail(this.paymentId)
    }
  }

  beforeDestroy() {
    this.stopPolling()
  }
}
</script>
